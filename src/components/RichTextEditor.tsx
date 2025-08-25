'use client';

import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 动态导入 ReactQuill 以避免 SSR 问题
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// 临时修复 React 19 兼容性问题
if (typeof window !== 'undefined') {
  // 为 ReactQuill 提供 findDOMNode 的兼容性支持
  const ReactDOM = require('react-dom');
  if (!ReactDOM.findDOMNode) {
    ReactDOM.findDOMNode = (node: any) => {
      if (node?.nodeType === 1) {
        return node;
      }
      return null;
    };
  }
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// 错误边界组件
class QuillErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('ReactQuill error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
          <p className="text-gray-500">富文本编辑器加载失败，请刷新页面重试</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '请输入内容...',
  className = '',
  disabled = false
}) => {
  const quillRef = useRef<any>(null);

  // Quill 编辑器配置
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image',
    'blockquote', 'code-block'
  ];

  return (
    <QuillErrorBoundary>
      <div className={`rich-text-editor ${className}`}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          style={{
            backgroundColor: disabled ? '#f5f5f5' : 'white',
          }}
        />
        <style jsx global>{`
          .rich-text-editor .ql-editor {
            min-height: 200px;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .rich-text-editor .ql-toolbar {
            border-top: 1px solid #ccc;
            border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-bottom: none;
        }
        
        .rich-text-editor .ql-container {
          border-bottom: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-top: none;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #999;
          font-style: italic;
        }
        
        .rich-text-editor .ql-editor:focus {
          outline: none;
        }
        
        .rich-text-editor .ql-toolbar.ql-snow {
          background: #f8f9fa;
        }
        
        .rich-text-editor .ql-container.ql-snow {
          background: white;
        }
      `}</style>
      </div>
    </QuillErrorBoundary>
  );
};

export default RichTextEditor;

// 富文本内容显示组件
export const RichTextDisplay: React.FC<{ content: string; className?: string }> = ({ 
  content, 
  className = '' 
}) => {
  return (
    <div 
      className={`rich-text-display ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};