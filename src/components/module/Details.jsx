import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Button from '../common/Button';
import html2pdf from 'html2pdf.js';

const Details = ({ data, onChange, showActions = true }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Initialize Tiptap editor with table extensions
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your plan details...',
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: data.content || data.description || '', // Use content first, fallback to description
    editable: isEditing,
  });

  // Update editor content when plan changes
  useEffect(() => {
    if (editor && (data.content || data.description)) {
      editor.commands.setContent(data.content || data.description || '');
    }
  }, [data.content, data.description, editor]);

  // Update editor editable state when editing mode changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [isEditing, editor]);

  const handleSave = async () => {
    if (!editor) return;

    // Get content from editor as HTML
    const content = editor.getHTML();

    const updatedPlan = {
      ...data,
      content, // Save AI-generated content in content field
      updatedAt: new Date().toISOString(),
    };

    await onChange(updatedPlan);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (editor) {
      editor.commands.setContent(data.content || data.description || '');
    }
    setIsEditing(false);
  };

  const handleDownload = () => {
    // Create a temporary div to hold the HTML content
    const element = document.createElement('div');
    element.className = 'pdf-export';

    // Add Tailwind CSS and Typography plugin via CDN
    const tailwindCDN = `<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">`;
    const typographyCDN = `<link href="https://cdn.jsdelivr.net/npm/@tailwindcss/typography@0.4.0/dist/typography.min.css" rel="stylesheet">`;

    // Create HTML content with Tailwind classes
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      ${tailwindCDN} 
      ${typographyCDN}
    </head>
    <body>
      <div class="pdf-container">
        <h1 class="text-2xl font-bold text-blue-600">${data.title}</h1>
        
        ${
          data.description
            ? `
        <div class="mt-4 mb-6 p-4 bg-gray-50 border-l-4 border-blue-500">
          <h2 class="text-lg font-semibold text-gray-800 mb-2">User Description</h2>
          <p class="text-gray-700">${data.description}</p>
        </div>
        `
            : ''
        }
        
        <div class="mt-4 prose prose-sm max-w-none">
          ${data.content || data.description || 'No content available'}
        </div>
        
        <div class="mt-8 pt-4 border-t border-gray-200">
          <div class="flex justify-between text-sm text-gray-500">
            <p class="mb-1">
              <span class="font-medium">Status:</span>
              <span class="status-badge ml-2">
                ${data.status || 'In Progress'}
              </span>
            </p>
            <p>
              <span class="font-medium">Created:</span>
              <span class="ml-1">
                ${new Date(data.createdAt).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

    // Set the HTML content
    element.innerHTML = htmlContent;

    // Configure PDF options
    const options = {
      margin: [10, 10, 10, 10],
      filename: `${data.title.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    // Generate and download the PDF
    html2pdf().from(element).set(options).save();
  };

  // Function to add a table to the editor
  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div className='bg-white rounded-lg border border-gray-100 shadow-md p-4 sm:p-6 mb-6'>
      {showActions && (
        <div className='flex flex-col sm:flex-row justify-end items-start sm:items-center mb-6 space-y-3 sm:space-y-0'>
          <div className='flex flex-wrap gap-2 w-full sm:w-auto'>
            {!isEditing ? (
              <>
                <Button
                  onClick={handleDownload}
                  className='flex-1 sm:flex-none text-green-600 hover:text-green-800 px-3 py-2 rounded border border-green-600 hover:border-green-800 transition-colors duration-200 text-sm'
                >
                  <span className='flex items-center justify-center'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 mr-1'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                      />
                    </svg>
                    <span className='hidden sm:inline'>Download PDF</span>
                    <span className='sm:hidden'>PDF</span>
                  </span>
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                  className='flex-1 sm:flex-none text-blue-600 hover:text-blue-800 px-3 py-2 rounded border border-blue-600 hover:border-blue-800 transition-colors duration-200 text-sm'
                >
                  <span className='flex items-center justify-center'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 mr-1'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 003-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                      />
                    </svg>
                    <span className='hidden sm:inline'>Edit Content</span>
                    <span className='sm:hidden'>Edit</span>
                  </span>
                </Button>
              </>
            ) : (
              <div className='flex gap-2 w-full sm:w-auto'>
                <Button
                  onClick={handleCancel}
                  className='flex-1 sm:flex-none text-gray-600 hover:text-gray-800 px-3 py-2 rounded border border-gray-400 hover:border-gray-600 transition-colors duration-200 text-sm'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className='flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors duration-200 text-sm'
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className='mb-6'>
        {isEditing && (
          <div className='bg-gray-50 p-2 border border-gray-200 rounded-md mb-3 overflow-x-auto'>
            <div className='flex flex-wrap gap-1 min-w-max'>
              <button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-2 rounded ${
                  editor?.isActive('bold') ? 'bg-gray-200' : ''
                }`}
                title='Bold'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  width='16'
                  height='16'
                >
                  <path fill='none' d='M0 0h24v24H0z' />
                  <path d='M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8z' />
                </svg>
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-2 rounded ${
                  editor?.isActive('italic') ? 'bg-gray-200' : ''
                }`}
                title='Italic'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  width='16'
                  height='16'
                >
                  <path fill='none' d='M0 0h24v24H0z' />
                  <path d='M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z' />
                </svg>
              </button>
              <button
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`p-2 rounded ${
                  editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
                }`}
                title='Heading'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  width='16'
                  height='16'
                >
                  <path fill='none' d='M0 0H24V24H0z' />
                  <path d='M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm14.5 4c2.071 0 3.75 1.679 3.75 3.75 0 .857-.288 1.648-.772 2.28l-.148.18L18.034 18H22v2h-7v-1.556l4.82-5.546c.268-.307.43-.709.43-1.148 0-.966-.784-1.75-1.75-1.75-.918 0-1.671.707-1.744 1.606l-.006.144h-2C14.75 9.679 16.429 8 18.5 8z' />
                </svg>
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded ${
                  editor?.isActive('bulletList') ? 'bg-gray-200' : ''
                }`}
                title='Bullet List'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  width='16'
                  height='16'
                >
                  <path fill='none' d='M0 0h24v24H0z' />
                  <path d='M8 4h13v2H8V4zm-5-.5h3v3H3v-3zm0 7h3v3H3v-3zm0 7h3v3H3v-3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z' />
                </svg>
              </button>
              <button
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
                className={`p-2 rounded ${
                  editor?.isActive('orderedList') ? 'bg-gray-200' : ''
                }`}
                title='Numbered List'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  width='16'
                  height='16'
                >
                  <path fill='none' d='M0 0h24v24H0z' />
                  <path d='M8 4h13v2H8V4zM5 3v3h1v1H3V6h1V4H3V3h2zm-2 7h3v1h2v1H3v-1h3v-1H3v-1h3v1zm2 5v2H3v-1h1v-1h1zm0 2h1v1H3v-1h2zm8-6h13v2H8v-2zm0 7h13v2H8v-2z' />
                </svg>
              </button>
              <button
                onClick={addTable}
                className='p-2 rounded hover:bg-gray-200'
                title='Insert Table'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  width='16'
                  height='16'
                >
                  <path fill='none' d='M0 0h24v24H0z' />
                  <path d='M4 8h16V5H4v3zm10 11v-9h-4v9h4zm2 0h4v-9h-4v9zm-8 0v-9H4v9h4zM3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z' />
                </svg>
              </button>
              {editor?.isActive('table') && (
                <>
                  <button
                    onClick={() =>
                      editor.chain().focus().addColumnBefore().run()
                    }
                    className='p-2 rounded hover:bg-gray-200'
                    title='Add Column Before'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      width='16'
                      height='16'
                    >
                      <path fill='none' d='M0 0H24V24H0z' />
                      <path d='M10 3v18H8V3h2zm6 0v18h-2V3h2zM2 9h5v2H2V9zm15 0h5v2h-5V9z' />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().addColumnAfter().run()
                    }
                    className='p-2 rounded hover:bg-gray-200'
                    title='Add Column After'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      width='16'
                      height='16'
                    >
                      <path fill='none' d='M0 0H24V24H0z' />
                      <path d='M10 3v18H8V3h2zm6 0v18h-2V3h2zM2 9h5v2H2V9zm15 0h5v2h-5V9z' />
                    </svg>
                  </button>
                  <button
                    onClick={() => editor.chain().focus().addRowBefore().run()}
                    className='p-2 rounded hover:bg-gray-200'
                    title='Add Row Before'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      width='16'
                      height='16'
                    >
                      <path fill='none' d='M0 0H24V24H0z' />
                      <path d='M20 13c.552 0 1 .448 1 1v6c0 .552-.448 1-1 1H4c-.552 0-1-.448-1-1v-6c0-.552.448-1 1-1h16zm0 2H4v4h16v-4zM3 3h18c.552 0 1 .448 1 1v16c0 .552-.448 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v4h16V5H4z' />
                    </svg>
                  </button>
                  <button
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    className='p-2 rounded hover:bg-gray-200'
                    title='Add Row After'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      width='16'
                      height='16'
                    >
                      <path fill='none' d='M0 0H24V24H0z' />
                      <path d='M12 13a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm9 4h-5v5h-2v-5H9v-2h5V8h2v5h5v2z' />
                    </svg>
                  </button>
                  <button
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    className='p-2 rounded hover:bg-gray-200'
                    title='Delete Table'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      width='16'
                      height='16'
                    >
                      <path fill='none' d='M0 0h24v24H0z' />
                      <path d='M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z' />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        <div className='table-container'>
          <EditorContent
            editor={editor}
            className='prose prose-sm max-w-none border border-gray-200 rounded-md p-3 sm:p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px] mobile-scroll cmc-content'
          />
        </div>
      </div>

      <div className='border-t border-gray-200 pt-4 mt-4'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2'>
          <p className='text-sm text-gray-500'>
            <span className='font-medium'>Status:</span>
            <span className='ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>
              {data.status || 'In Progress'}
            </span>
          </p>
          <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500'>
            <p>
              <span className='font-medium'>Created:</span>
              <span className='ml-2'>
                {new Date(data.createdAt).toLocaleDateString()}
              </span>
            </p>
            {data.updatedAt && (
              <p>
                <span className='font-medium'>Updated:</span>
                <span className='ml-2'>
                  {new Date(data.updatedAt).toLocaleDateString()}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
