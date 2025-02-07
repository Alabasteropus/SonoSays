import { createEditor, $getRoot, $createParagraphNode } from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $createHeadingNode, HeadingNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";

export function initializeEditor() {
  const editor = createEditor({
    namespace: "WriteWithAI",
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      LinkNode,
      TableNode,
      TableCellNode,
      TableRowNode
    ],
    onError: (error) => {
      console.error("Editor Error:", error);
    }
  });

  editor.update(() => {
    const root = $getRoot();
    if (root.getFirstChild() === null) {
      const paragraph = $createParagraphNode();
      root.append(paragraph);
    }
  });

  return editor;
}

export function getEditorContent(editor: any) {
  let content = "";
  editor.update(() => {
    content = $generateHtmlFromNodes(editor);
  });
  return content;
}

export function setEditorContent(editor: any, content: string) {
  editor.update(() => {
    const root = $getRoot();
    root.clear();
    const parser = new DOMParser();
    const dom = parser.parseFromString(content, "text/html");
    const nodes = $generateNodesFromDOM(editor, dom);
    root.append(...nodes);
  });
}
