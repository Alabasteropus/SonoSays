import { useEffect, useState } from "react";
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
import { $getRoot, $createParagraphNode, EditorThemeClasses } from "lexical";
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

const theme: EditorThemeClasses = {
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
  image: "editor-image",
  link: "editor-link",
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
    underlineStrikethrough: "editor-text-underlineStrikethrough",
    code: "editor-text-code"
  },
  code: "editor-code",
  codeHighlight: {
    atrule: "editor-tokenAttr",
    attr: "editor-tokenAttr",
    boolean: "editor-tokenProperty",
    builtin: "editor-tokenSelector",
    cdata: "editor-tokenComment",
    char: "editor-tokenSelector",
    class: "editor-tokenFunction",
    "class-name": "editor-tokenFunction",
    comment: "editor-tokenComment",
    constant: "editor-tokenProperty",
    deleted: "editor-tokenProperty",
    doctype: "editor-tokenComment",
    entity: "editor-tokenOperator",
    function: "editor-tokenFunction",
    important: "editor-tokenVariable",
    inserted: "editor-tokenSelector",
    keyword: "editor-tokenAttr",
    namespace: "editor-tokenVariable",
    number: "editor-tokenProperty",
    operator: "editor-tokenOperator",
    prolog: "editor-tokenComment",
    property: "editor-tokenProperty",
    punctuation: "editor-tokenPunctuation",
    regex: "editor-tokenVariable",
    selector: "editor-tokenSelector",
    string: "editor-tokenSelector",
    symbol: "editor-tokenProperty",
    tag: "editor-tokenProperty",
    url: "editor-tokenOperator",
    variable: "editor-tokenVariable"
  }
};

export function Editor({ initialContent, onChange }: EditorProps) {
  const nodes = [
    HeadingNode,
    ListNode,
    ListItemNode,
    LinkNode,
    TableNode,
    TableCellNode,
    TableRowNode
  ];

  const config = {
    namespace: "WriteWithAI",
    theme,
    nodes,
    onError: (error: Error) => {
      console.error("Editor Error:", error);
    }
  };

  const handleChange = () => {
    if (onChange) {
      onChange(getEditorContent(editor));
    }
  };

  const [editor] = useState(() => initializeEditor());

  useEffect(() => {
    if (initialContent) {
      setEditorContent(editor, initialContent);
    }
  }, [editor, initialContent]);

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
    <LexicalComposer initialConfig={config}>
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

        <div className="p-4 min-h-[300px]">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="outline-none min-h-[250px]" />
            }
            placeholder={
              <div className="absolute top-[68px] left-[24px] text-muted-foreground">
                Start writing...
              </div>
            }
            ErrorBoundary={() => null}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <OnChangePlugin onChange={handleChange} />
          <TabIndentationPlugin />
          <LinkPlugin />
          <ListPlugin />
          <TablePlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}