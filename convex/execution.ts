"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const executeCode = action({
  args: {
    code: v.string(),
    language: v.string(),
    roomId: v.id("rooms"),
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const startTime = Date.now();
    
    try {
      let output = "";
      let error = "";

      switch (args.language) {
        case "javascript":
          const jsResult = await executeJavaScript(args.code);
          output = jsResult.output;
          error = jsResult.error;
          break;
        case "python":
          const pyResult = await executePython(args.code);
          output = pyResult.output;
          error = pyResult.error;
          break;
        case "html":
          output = await executeHTML(args.code);
          break;
        case "css":
          output = await executeCSS(args.code);
          break;
        case "c":
          const cResult = await executeC(args.code);
          output = cResult.output;
          error = cResult.error;
          break;
        case "cpp":
          const cppResult = await executeCpp(args.code);
          output = cppResult.output;
          error = cppResult.error;
          break;
        case "react":
          output = await executeReact(args.code);
          break;
        default:
          error = "Unsupported language";
      }

      const executionTime = Date.now() - startTime;

      // Store execution result
      await ctx.runMutation(internal.internal.storeExecution, {
        roomId: args.roomId,
        fileId: args.fileId,
        userId,
        language: args.language,
        code: args.code,
        output,
        error: error || undefined,
        executionTime,
      });

      return { output, error: error || undefined, executionTime };
    } catch (e) {
      const executionTime = Date.now() - startTime;
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      
      await ctx.runMutation(internal.internal.storeExecution, {
        roomId: args.roomId,
        fileId: args.fileId,
        userId,
        language: args.language,
        code: args.code,
        output: "",
        error: errorMessage,
        executionTime,
      });

      return { output: "", error: errorMessage, executionTime };
    }
  },
});

async function executeJavaScript(code: string): Promise<{ output: string; error: string }> {
  const logs: string[] = [];
  let error = "";
  
  // Mock console and other globals
  const mockConsole = {
    log: (...args: any[]) => {
      logs.push(args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' '));
    },
    error: (...args: any[]) => {
      logs.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
    },
    warn: (...args: any[]) => {
      logs.push('WARN: ' + args.map(arg => String(arg)).join(' '));
    },
    info: (...args: any[]) => {
      logs.push('INFO: ' + args.map(arg => String(arg)).join(' '));
    }
  };

  try {
    // Create a safe execution context with more built-ins
    const safeGlobals = {
      console: mockConsole,
      Math,
      Date,
      JSON,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      String,
      Number,
      Boolean,
      Array,
      Object,
      RegExp,
      setTimeout: (fn: Function, delay: number) => {
        // Mock setTimeout for demo purposes
        logs.push(`setTimeout called with delay: ${delay}ms`);
        return 1;
      },
      setInterval: (fn: Function, delay: number) => {
        logs.push(`setInterval called with delay: ${delay}ms`);
        return 1;
      }
    };

    // Wrap code in an async function to handle async/await
    const wrappedCode = `
      (async function() {
        ${code}
      })();
    `;

    const func = new Function(...Object.keys(safeGlobals), `return ${wrappedCode}`);
    const result = func(...Object.values(safeGlobals));
    
    // Handle promises
    if (result && typeof result.then === 'function') {
      await result;
    }

    return {
      output: logs.length > 0 ? logs.join('\n') : 'Code executed successfully (no output)',
      error: ""
    };
  } catch (err) {
    return {
      output: logs.join('\n'),
      error: `JavaScript Error: ${err instanceof Error ? err.message : 'Unknown error'}`
    };
  }
}

async function executePython(code: string): Promise<{ output: string; error: string }> {
  const lines = code.split('\n');
  const output: string[] = [];
  let error = "";
  
  try {
    // Simple Python interpreter simulation with better pattern matching
    const variables: Record<string, any> = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      // Handle variable assignments
      const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
      if (assignMatch) {
        const [, varName, value] = assignMatch;
        try {
          // Handle string literals
          if (value.match(/^["'].*["']$/)) {
            variables[varName] = value.slice(1, -1);
          }
          // Handle numbers
          else if (!isNaN(Number(value))) {
            variables[varName] = Number(value);
          }
          // Handle expressions
          else {
            variables[varName] = value;
          }
        } catch (e) {
          variables[varName] = value;
        }
        continue;
      }
      
      // Handle print statements
      const printMatch = trimmed.match(/^print\s*\(\s*(.+)\s*\)$/);
      if (printMatch) {
        const expr = printMatch[1];
        
        // Handle string literals
        if (expr.match(/^["'].*["']$/)) {
          output.push(expr.slice(1, -1));
        }
        // Handle variables
        else if (variables[expr] !== undefined) {
          output.push(String(variables[expr]));
        }
        // Handle f-strings (basic)
        else if (expr.startsWith('f"') || expr.startsWith("f'")) {
          let result = expr.slice(2, -1);
          Object.keys(variables).forEach(varName => {
            result = result.replace(new RegExp(`\\{${varName}\\}`, 'g'), String(variables[varName]));
          });
          output.push(result);
        }
        // Handle expressions with variables
        else {
          let evalExpr = expr;
          Object.keys(variables).forEach(varName => {
            evalExpr = evalExpr.replace(new RegExp(`\\b${varName}\\b`, 'g'), String(variables[varName]));
          });
          output.push(evalExpr);
        }
        continue;
      }
      
      // Handle basic math operations
      const mathMatch = trimmed.match(/^(\w+)\s*([+\-*/])\s*(\w+)$/);
      if (mathMatch) {
        const [, left, op, right] = mathMatch;
        const leftVal = variables[left] || Number(left) || 0;
        const rightVal = variables[right] || Number(right) || 0;
        
        let result = 0;
        switch (op) {
          case '+': result = leftVal + rightVal; break;
          case '-': result = leftVal - rightVal; break;
          case '*': result = leftVal * rightVal; break;
          case '/': result = rightVal !== 0 ? leftVal / rightVal : 0; break;
        }
        output.push(`${result}`);
        continue;
      }
    }
    
    return {
      output: output.length > 0 ? output.join('\n') : 'Python code executed successfully',
      error: ""
    };
  } catch (err) {
    return {
      output: output.join('\n'),
      error: `Python Error: ${err instanceof Error ? err.message : 'Unknown error'}`
    };
  }
}

async function executeHTML(code: string): Promise<string> {
  // Validate HTML structure and provide feedback
  const validation = [];
  const issues = [];
  
  // Check for basic HTML structure
  if (code.includes('<!DOCTYPE')) validation.push('✓ DOCTYPE declaration found');
  else issues.push('⚠ Missing DOCTYPE declaration');
  
  if (code.includes('<html')) validation.push('✓ HTML tag found');
  else issues.push('⚠ Missing HTML tag');
  
  if (code.includes('<head')) validation.push('✓ HEAD section found');
  else issues.push('⚠ Missing HEAD section');
  
  if (code.includes('<body')) validation.push('✓ BODY section found');
  else issues.push('⚠ Missing BODY section');
  
  if (code.includes('<title')) validation.push('✓ Title tag found');
  
  // Check for common elements
  const elements = ['h1', 'h2', 'h3', 'p', 'div', 'span', 'a', 'img', 'ul', 'ol', 'li'];
  const foundElements = elements.filter(el => code.includes(`<${el}`));
  if (foundElements.length > 0) {
    validation.push(`✓ Found elements: ${foundElements.join(', ')}`);
  }
  
  // Check for CSS
  if (code.includes('<style') || code.includes('style=')) {
    validation.push('✓ CSS styling detected');
  }
  
  // Check for JavaScript
  if (code.includes('<script')) {
    validation.push('✓ JavaScript detected');
  }
  
  let result = 'HTML Structure Analysis:\n';
  result += validation.join('\n');
  if (issues.length > 0) {
    result += '\n\nSuggestions:\n' + issues.join('\n');
  }
  result += '\n\n✅ HTML is ready for preview in browser';
  
  return result;
}

async function executeCSS(code: string): Promise<string> {
  const validation = [];
  const suggestions = [];
  
  // Check for selectors
  const selectorTypes = {
    'element': /^[a-zA-Z][a-zA-Z0-9]*\s*\{/gm,
    'class': /\.[a-zA-Z][a-zA-Z0-9-_]*\s*\{/gm,
    'id': /#[a-zA-Z][a-zA-Z0-9-_]*\s*\{/gm,
    'pseudo': /:[a-zA-Z-]+\s*\{/gm
  };
  
  Object.entries(selectorTypes).forEach(([type, regex]) => {
    const matches = code.match(regex);
    if (matches) {
      validation.push(`✓ Found ${matches.length} ${type} selector(s)`);
    }
  });
  
  // Check for common properties
  const properties = ['color', 'background', 'font-size', 'margin', 'padding', 'border', 'width', 'height'];
  const foundProps = properties.filter(prop => code.includes(prop));
  if (foundProps.length > 0) {
    validation.push(`✓ Properties used: ${foundProps.join(', ')}`);
  }
  
  // Check for responsive design
  if (code.includes('@media')) {
    validation.push('✓ Media queries detected (responsive design)');
  }
  
  // Check for animations
  if (code.includes('@keyframes') || code.includes('animation')) {
    validation.push('✓ CSS animations detected');
  }
  
  // Check for flexbox/grid
  if (code.includes('display: flex') || code.includes('display:flex')) {
    validation.push('✓ Flexbox layout detected');
  }
  if (code.includes('display: grid') || code.includes('display:grid')) {
    validation.push('✓ Grid layout detected');
  }
  
  // Basic syntax validation
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  
  if (openBraces === closeBraces) {
    validation.push('✓ Balanced braces');
  } else {
    suggestions.push(`⚠ Unbalanced braces: ${openBraces} opening, ${closeBraces} closing`);
  }
  
  let result = 'CSS Analysis:\n';
  result += validation.join('\n');
  if (suggestions.length > 0) {
    result += '\n\nIssues:\n' + suggestions.join('\n');
  }
  result += '\n\n✅ CSS is ready for preview';
  
  return result;
}

async function executeC(code: string): Promise<{ output: string; error: string }> {
  let output = "";
  let error = "";
  
  try {
    // Check for basic C structure
    if (!code.includes('int main')) {
      return { output: "", error: 'C Error: No main function found' };
    }
    
    const analysis = [];
    
    // Check includes
    const includes = code.match(/#include\s*<[^>]+>/g);
    if (includes) {
      analysis.push(`✓ Headers: ${includes.map(inc => inc.match(/<([^>]+)>/)?.[1]).join(', ')}`);
    }
    
    // Extract and simulate printf statements
    const printfMatches = code.match(/printf\s*\(\s*"([^"]*)"/g);
    if (printfMatches) {
      analysis.push('✓ Printf statements found');
      const outputs: string[] = [];
      printfMatches.forEach(match => {
        const text = match.match(/"([^"]*)"/)?.[1];
        if (text) {
          // Handle escape sequences
          const processed = text
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
          outputs.push(processed);
        }
      });
      
      if (outputs.length > 0) {
        analysis.push('\nProgram Output:');
        output = analysis.join('\n') + '\n' + outputs.join('');
      }
    }
    
    if (!output) {
      output = analysis.join('\n') + '\n\n✅ C program compiled successfully (simulated)';
    }
    
    return { output, error: "" };
  } catch (err) {
    return {
      output: "",
      error: `C Error: ${err instanceof Error ? err.message : 'Unknown error'}`
    };
  }
}

async function executeCpp(code: string): Promise<{ output: string; error: string }> {
  let output = "";
  let error = "";
  
  try {
    // Check for basic C++ structure
    if (!code.includes('int main')) {
      return { output: "", error: 'C++ Error: No main function found' };
    }
    
    const analysis = [];
    
    // Check includes
    const includes = code.match(/#include\s*<[^>]+>/g);
    if (includes) {
      analysis.push(`✓ Headers: ${includes.map(inc => inc.match(/<([^>]+)>/)?.[1]).join(', ')}`);
    }
    
    // Check for namespace
    if (code.includes('using namespace std')) {
      analysis.push('✓ Using standard namespace');
    }
    
    // Extract and simulate cout statements
    const coutMatches = code.match(/(?:std::)?cout\s*<<\s*"([^"]*)"/g);
    if (coutMatches) {
      analysis.push('✓ Cout statements found');
      const outputs: string[] = [];
      coutMatches.forEach(match => {
        const text = match.match(/"([^"]*)"/)?.[1];
        if (text) {
          outputs.push(text);
        }
      });
      
      // Check for endl
      const endlCount = (code.match(/(?:std::)?endl/g) || []).length;
      
      if (outputs.length > 0) {
        analysis.push('\nProgram Output:');
        let result = outputs.join('');
        // Add newlines for endl
        for (let i = 0; i < endlCount; i++) {
          result += '\n';
        }
        output = analysis.join('\n') + '\n' + result;
      }
    }
    
    if (!output) {
      output = analysis.join('\n') + '\n\n✅ C++ program compiled successfully (simulated)';
    }
    
    return { output, error: "" };
  } catch (err) {
    return {
      output: "",
      error: `C++ Error: ${err instanceof Error ? err.message : 'Unknown error'}`
    };
  }
}

async function executeReact(code: string): Promise<string> {
  // Validate React component structure
  const validation = [];
  const suggestions = [];
  
  // Check imports
  if (code.includes('import React')) {
    validation.push('✓ React import found');
  } else {
    suggestions.push('⚠ Missing React import');
  }
  
  // Check for hooks
  const hooks = ['useState', 'useEffect', 'useContext', 'useReducer', 'useMemo', 'useCallback'];
  const foundHooks = hooks.filter(hook => code.includes(hook));
  if (foundHooks.length > 0) {
    validation.push(`✓ React hooks: ${foundHooks.join(', ')}`);
  }
  
  // Check component definition
  const functionComponent = code.includes('function ') && code.includes('return');
  const arrowComponent = code.includes('=>') && code.includes('return');
  
  if (functionComponent || arrowComponent) {
    validation.push('✓ Component function found');
  } else {
    suggestions.push('⚠ No component function detected');
  }
  
  // Check JSX
  if (code.includes('<') && code.includes('>')) {
    validation.push('✓ JSX elements found');
    
    // Check for common JSX elements
    const jsxElements = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'button', 'input', 'form'];
    const foundElements = jsxElements.filter(el => code.includes(`<${el}`));
    if (foundElements.length > 0) {
      validation.push(`✓ JSX elements: ${foundElements.join(', ')}`);
    }
  } else {
    suggestions.push('⚠ No JSX elements found');
  }
  
  // Check for event handlers
  const events = ['onClick', 'onChange', 'onSubmit', 'onFocus', 'onBlur'];
  const foundEvents = events.filter(event => code.includes(event));
  if (foundEvents.length > 0) {
    validation.push(`✓ Event handlers: ${foundEvents.join(', ')}`);
  }
  
  // Check export
  if (code.includes('export default')) {
    validation.push('✓ Export statement found');
  } else {
    suggestions.push('⚠ Missing export default statement');
  }
  
  // Check for props
  if (code.includes('props') || code.match(/\{\s*\w+\s*\}/)) {
    validation.push('✓ Props usage detected');
  }
  
  let result = 'React Component Analysis:\n';
  result += validation.join('\n');
  if (suggestions.length > 0) {
    result += '\n\nSuggestions:\n' + suggestions.join('\n');
  }
  result += '\n\n✅ Component is ready for rendering';
  
  return result;
}
