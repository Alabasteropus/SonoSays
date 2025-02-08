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
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
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
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2"
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
    underlineStrikethrough: "editor-text-underlineStrikethrough"
  }
};

const FONT_SIZE = 12; // pt
const LINE_HEIGHT = 1.5;
const PIXELS_PER_PT = 1.333333; // conversion factor

export function Editor({ initialContent, onChange }: EditorProps) {
  const [editor] = useState(() => initializeEditor());
  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    if (initialContent) {
      setEditorContent(editor, initialContent);
    }
  }, [editor, initialContent]);

  useEffect(() => {
    const calculatePages = () => {
      if (!contentRef.current) return;

      // Get content metrics
      const content = contentRef.current;
      const lineHeightPx = FONT_SIZE * LINE_HEIGHT * PIXELS_PER_PT;
      const contentHeight = content.scrollHeight;
      const pageContentHeight = 9 * 96; // 9 inches * 96 DPI (content area)

      // Calculate how many lines fit per page
      const linesPerPage = Math.floor(pageContentHeight / lineHeightPx);

      // Calculate total pages needed
      const totalLines = Math.ceil(contentHeight / lineHeightPx);
      const newPageCount = Math.max(1, Math.ceil(totalLines / linesPerPage));

      if (newPageCount !== pageCount) {
        setPageCount(newPageCount);
      }
    };

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(calculatePages);
    });

    if (contentRef.current) {
      observer.observe(contentRef.current);
      calculatePages();
    }

    return () => observer.disconnect();
  }, [pageCount]);

  const handleChange = () => {
    if (onChange) {
      onChange(getEditorContent(editor));
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
          <div className="editor-container" ref={editorRef}>
            {Array.from({ length: pageCount }).map((_, index) => (
              <div key={index} className="page-container">
                <div className="page-content">
                  <div className="editor-content" ref={contentRef}>
                    <RichTextPlugin
                      contentEditable={<ContentEditable className="editor-input" />}
                      placeholder={
                        <div className="editor-placeholder">
                          Start writing...
                        </div>
                      }
                      ErrorBoundary={() => null}
                    />
                  </div>
                </div>
                <div className="page-number">Page {index + 1}</div>
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