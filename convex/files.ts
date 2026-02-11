import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getRoomFiles = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is member of the room
    const room = await ctx.db.get(args.roomId);
    if (!room || !room.members.includes(userId)) {
      throw new Error("Not authorized to access this room");
    }

    return await ctx.db
      .query("files")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});

export const getFile = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    // Check if user is member of the room
    const room = await ctx.db.get(file.roomId);
    if (!room || !room.members.includes(userId)) {
      throw new Error("Not authorized to access this file");
    }

    return file;
  },
});

export const createFile = mutation({
  args: {
    roomId: v.id("rooms"),
    name: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is member of the room
    const room = await ctx.db.get(args.roomId);
    if (!room || !room.members.includes(userId)) {
      throw new Error("Not authorized to create files in this room");
    }

    const initialContent = getInitialCode(args.language);

    return await ctx.db.insert("files", {
      roomId: args.roomId,
      name: args.name,
      content: initialContent,
      language: args.language,
      createdBy: userId,
      lastModifiedBy: userId,
      version: 1,
    });
  },
});

export const updateFile = mutation({
  args: {
    fileId: v.id("files"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    // Check if user is member of the room
    const room = await ctx.db.get(file.roomId);
    if (!room || !room.members.includes(userId)) {
      throw new Error("Not authorized to update this file");
    }

    await ctx.db.patch(args.fileId, {
      content: args.content,
      lastModifiedBy: userId,
      version: file.version + 1,
    });

    return args.fileId;
  },
});

// Real-time file content update (like chat messages)
export const updateFileContent = mutation({
  args: {
    fileId: v.id("files"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    // Check if user is member of the room
    const room = await ctx.db.get(file.roomId);
    if (!room || !room.members.includes(userId)) {
      throw new Error("Not authorized to update this file");
    }

    // Update file content in real-time
    await ctx.db.patch(args.fileId, {
      content: args.content,
      lastModifiedBy: userId,
      version: file.version + 1,
    });

    return {
      fileId: args.fileId,
      content: args.content,
      lastModifiedBy: userId,
      version: file.version + 1,
    };
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    // Check if user is member of the room and has permission
    const room = await ctx.db.get(file.roomId);
    if (!room || !room.members.includes(userId)) {
      throw new Error("Not authorized to delete this file");
    }

    // Only creator, room owner, or admin can delete files
    const canDelete = file.createdBy === userId || 
                     room.createdBy === userId || 
                     (room.admins && room.admins.includes(userId));

    if (!canDelete) {
      throw new Error("Not authorized to delete this file");
    }

    await ctx.db.delete(args.fileId);
    return args.fileId;
  },
});

function getInitialCode(language: string): string {
  const templates: Record<string, string> = {
    javascript: `// Welcome to CodeCollab!
console.log("Hello, World!");

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("CodeCollab"));

// Try some math
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log("Sum of numbers:", sum);`,

    python: `# Welcome to CodeCollab!
print("Hello, World!")

def greet(name):
    return f"Hello, {name}!"

print(greet("CodeCollab"))

# Try some math
numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
print(f"Sum of numbers: {total}")

# Variables and operations
x = 10
y = 20
print(f"{x} + {y} = {x + y}")`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeCollab - HTML Preview</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        h1 { color: #fff; text-align: center; }
        .feature { margin: 20px 0; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Welcome to CodeCollab!</h1>
        <p>Start building amazing web experiences together!</p>
        
        <div class="feature">
            <h3>✨ Real-time Collaboration</h3>
            <p>Code together with your team in real-time</p>
        </div>
        
        <div class="feature">
            <h3>🎨 Multiple Languages</h3>
            <p>Support for HTML, CSS, JavaScript, Python, C, C++, and React</p>
        </div>
        
        <button onclick="alert('Hello from CodeCollab!')" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Click me!
        </button>
    </div>
</body>
</html>`,

    css: `/* Welcome to CodeCollab! */
/* Modern CSS with animations and responsive design */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    max-width: 800px;
    background: rgba(255, 255, 255, 0.95);
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

h1 {
    color: #333;
    text-align: center;
    margin-bottom: 20px;
    font-size: 2.5em;
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.card {
    background: #f8f9fa;
    padding: 20px;
    margin: 15px 0;
    border-radius: 10px;
    border-left: 4px solid #667eea;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateX(10px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.button {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;
    display: inline-block;
    text-decoration: none;
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
    .container {
        margin: 20px;
        padding: 20px;
    }
    
    h1 {
        font-size: 2em;
    }
}`,

    c: `#include <stdio.h>
#include <string.h>
#include <math.h>

int main() {
    printf("Hello, World!\\n");
    printf("Welcome to CodeCollab!\\n");
    
    // Variables and calculations
    int a = 10, b = 20;
    printf("a = %d, b = %d\\n", a, b);
    printf("a + b = %d\\n", a + b);
    printf("a * b = %d\\n", a * b);
    
    // String operations
    char name[] = "CodeCollab";
    printf("Project name: %s\\n", name);
    printf("Name length: %lu\\n", strlen(name));
    
    // Math functions
    double x = 16.0;
    printf("Square root of %.1f = %.2f\\n", x, sqrt(x));
    
    // Loop example
    printf("Numbers 1 to 5: ");
    for(int i = 1; i <= 5; i++) {
        printf("%d ", i);
    }
    printf("\\n");
    
    return 0;
}`,

    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>

using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    cout << "Welcome to CodeCollab!" << endl;
    
    // Variables and calculations
    int a = 10, b = 20;
    cout << "a = " << a << ", b = " << b << endl;
    cout << "a + b = " << a + b << endl;
    cout << "a * b = " << a * b << endl;
    
    // String operations
    string name = "CodeCollab";
    cout << "Project name: " << name << endl;
    cout << "Name length: " << name.length() << endl;
    
    // Vector operations
    vector<int> numbers = {1, 2, 3, 4, 5};
    cout << "Numbers: ";
    for(int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    // Math functions
    double x = 16.0;
    cout << "Square root of " << x << " = " << sqrt(x) << endl;
    
    // Algorithm example
    int sum = 0;
    for(int num : numbers) {
        sum += num;
    }
    cout << "Sum of numbers: " << sum << endl;
    
    return 0;
}`,

    react: `import React, { useState, useEffect } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Welcome to CodeCollab!');
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build awesome apps', completed: false }
  ]);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  const addTodo = () => {
    const newTodo = {
      id: todos.length + 1,
      text: \`New task \${todos.length + 1}\`,
      completed: false
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#333',
        background: 'linear-gradient(45deg, #667eea, #764ba2)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🚀 {message}
      </h1>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h3>Counter Example</h3>
        <p>You clicked {count} times</p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Increment
        </button>
        <button 
          onClick={() => setCount(0)}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '10px'
      }}>
        <h3>Todo List Example</h3>
        <button 
          onClick={addTodo}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '15px'
          }}
        >
          Add Todo
        </button>
        
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.map(todo => (
            <li 
              key={todo.id}
              style={{
                padding: '10px',
                margin: '5px 0',
                background: todo.completed ? '#d4edda' : '#fff',
                border: '1px solid #ddd',
                borderRadius: '5px',
                cursor: 'pointer',
                textDecoration: todo.completed ? 'line-through' : 'none'
              }}
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.completed ? '✅' : '⭕'} {todo.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;`,
  };
  return templates[language] || "// Start coding here!";
}
