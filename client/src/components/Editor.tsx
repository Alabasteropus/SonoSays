import { useEffect, useState, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import {
  CLEAR_HISTORY_COMMAND,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
import { $getRoot, $createParagraphNode } from "lexical";
import { HeadingNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { initializeEditor, getEditorContent, setEditorContent } from "@/lib/editor";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  Link,
  Table,
  Heading1,
  Undo,
  Redo
} from "lucide-react";

interface EditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

const theme = {
  ltr: "ltr",
  rtl: "rtl",
  placeholder: "editor-placeholder",
  paragraph: "editor-paragraph",
  quote: "editor-quote",
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
    h3: "editor-heading-h3",
    h4: "editor-heading-h4",
    h5: "editor-heading-h5"
  },
  list: {
    nested: {
      listitem: "editor-nested-listitem"
    },
    ol: "editor-list-ol",
    ul: "editor-list-ul",
    listitem: "editor-listitem"
  },
  link: "editor-link",
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
    underlineStrikethrough: "editor-text-underlineStrikethrough",
  },
  root: "editor-root",
  page: "editor-page"
};

export function Editor({ initialContent, onChange }: EditorProps) {
  const [editor] = useState(() => initializeEditor());
  const editorRef = useRef<HTMLDivElement>(null);
  const [activePages, setActivePages] = useState([0]);
  const lastContentHeights = useRef<number[]>([]);

  useEffect(() => {
    if (initialContent) {
      setEditorContent(editor, initialContent);
    }
  }, [editor, initialContent]);

  const handleChange = () => {
    if (onChange) {
      const content = getEditorContent(editor);
      onChange(content);

      // Check for page breaks after content changes
      if (editorRef.current) {
        const contentDivs = Array.from(editorRef.current.querySelectorAll('.editor-input')) as HTMLElement[];
        const pageHeight = 9 * 96; // 9 inches (content area) * 96 DPI
        const newPageHeights: number[] = [];
        let newActivePages = [...activePages];

        contentDivs.forEach((div, index) => {
          const contentHeight = div.scrollHeight;
          newPageHeights[index] = contentHeight;

          // Only create a new page if this is the last page and it overflows
          if (index === contentDivs.length - 1 && contentHeight > pageHeight) {
            const nextPageIndex = index + 1;
            if (!newActivePages.includes(nextPageIndex)) {
              newActivePages.push(nextPageIndex);
            }
          }

          // Remove empty pages (except the first one)
          if (index > 0 && contentHeight === 0) {
            newActivePages = newActivePages.filter(p => p !== index);
          }
        });

        // Keep pages in order
        newActivePages.sort((a, b) => a - b);

        // Only update if there are actual changes
        if (JSON.stringify(newActivePages) !== JSON.stringify(activePages)) {
          setActivePages(newActivePages);
        }

        lastContentHeights.current = newPageHeights;
      }
    }
  };

  const formatText = (format: string) => {
    editor.update(() => {
      if (format === "undo") {
        editor.dispatchCommand(UNDO_COMMAND, undefined);
      } else if (format === "redo") {
        editor.dispatchCommand(REDO_COMMAND, undefined);
      } else {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format as any);
      }
    });
  };

  return (
    <LexicalComposer 
      initialConfig={{ 
        theme,
        nodes: [HeadingNode, ListNode, ListItemNode, LinkNode, TableNode, TableCellNode, TableRowNode],
        onError: (error) => console.error("Editor Error:", error),
        namespace: "WriteWithAI"
      }}
    >
      <div className="border rounded-lg shadow-sm">
        <div className="flex gap-2 p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText("undo")}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText("redo")}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText("bold")}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText("italic")}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText("heading")}
            title="Heading"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText("bullet")}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText("link")}
            title="Link"
          >
            <Link className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText("table")}
            title="Table"
          >
            <Table className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 min-h-[842px] bg-muted overflow-auto">
          <div className="editor-container mx-auto" ref={editorRef}>
            {activePages.map((pageIndex) => (
              <div key={pageIndex} className="page-container">
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable className="editor-input" />
                  }
                  placeholder={
                    pageIndex === 0 ? (
                      <div className="editor-placeholder">
                        Start writing...
                      </div>
                    ) : null
                  }
                  ErrorBoundary={() => null}
                />
                <div className="page-number">Page {pageIndex + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <HistoryPlugin />
      <AutoFocusPlugin />
      <OnChangePlugin onChange={handleChange} />
      <TabIndentationPlugin />
      <LinkPlugin />
      <ListPlugin />
      <TablePlugin />
    </LexicalComposer>
  );
}