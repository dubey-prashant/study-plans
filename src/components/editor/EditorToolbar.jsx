import React from 'react';

const EditorToolbar = ({ editor }) => {
  // Function to add a table to the editor
  const addTable = () => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div className='bg-gray-50 p-2 border border-gray-200 rounded-md mb-2 flex flex-wrap gap-2'>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleBold().run()}
        isActive={editor?.isActive('bold')}
        title='Bold'
        icon={<BoldIcon />}
      />
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        isActive={editor?.isActive('italic')}
        title='Italic'
        icon={<ItalicIcon />}
      />
      <ToolbarButton
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 2 }).run()
        }
        isActive={editor?.isActive('heading', { level: 2 })}
        title='Heading'
        icon={<HeadingIcon />}
      />
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        isActive={editor?.isActive('bulletList')}
        title='Bullet List'
        icon={<BulletListIcon />}
      />
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        isActive={editor?.isActive('orderedList')}
        title='Numbered List'
        icon={<OrderedListIcon />}
      />
      <ToolbarButton
        onClick={addTable}
        title='Insert Table'
        icon={<TableIcon />}
      />

      {editor?.isActive('table') && (
        <>
          <ToolbarButton
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            title='Add Column Before'
            icon={<AddColumnBeforeIcon />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            title='Add Column After'
            icon={<AddColumnAfterIcon />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().addRowBefore().run()}
            title='Add Row Before'
            icon={<AddRowBeforeIcon />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().addRowAfter().run()}
            title='Add Row After'
            icon={<AddRowAfterIcon />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().deleteTable().run()}
            title='Delete Table'
            icon={<DeleteTableIcon />}
          />
        </>
      )}
    </div>
  );
};

// Reusable toolbar button component
const ToolbarButton = ({ onClick, isActive, title, icon }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded ${isActive ? 'bg-gray-200' : ''} hover:bg-gray-200`}
    title={title}
  >
    {icon}
  </button>
);

// Icon components
const BoldIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    width='16'
    height='16'
  >
    <path fill='none' d='M0 0h24v24H0z' />
    <path d='M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8z' />
  </svg>
);

// Add other icon components here...
const ItalicIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    width='16'
    height='16'
  >
    <path fill='none' d='M0 0h24v24H0z' />
    <path d='M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z' />
  </svg>
);

// Add remaining icon components

export default EditorToolbar;
