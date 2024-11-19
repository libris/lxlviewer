import {
  Decoration,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
  type DecorationSet
} from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { mount } from 'svelte';
import QualifierComponent from '$lib/components/QualifierComponent.svelte';

export type Qualifier = {
  key: string;
  keyLabel?: string;
  value: string;
  valueLabel?: string;
  operator: string;
}

class QualifierWidget extends WidgetType {
  constructor(
    readonly qualifier: Qualifier,
    readonly range: { from: number; to: number }
  ) {
    super();
  }

  // eq(other: QualifierWidget) {
  //   return (
  //     this.qualifier.type == other.qualifier.type &&
  //     this.qualifier.value == other.qualifier.value &&
  //     this.range == other.range
  //   );
  // }

  toDOM() {
    const container = document.createElement('span');
    container.style.cssText = `position: relative;`;
    mount(QualifierComponent, {
      target: container,
      props: {
        qualifier: this.qualifier,
        range: this.range
      }
    });
    return container;
  }
}

function qualifiers(view: EditorView) {
  const widgets = [];

  syntaxTree(view.state).iterate({
    enter: (node) => {
      if (node.name === 'Qualifier') {
        const qKeyNode = node.node.getChild('QualifierKey');
        const qOperatorNode = qKeyNode?.nextSibling;
        const qValueNode = node.node.getChild('QualifierValue');

        const doc = view.state.doc.toString();

        const qKeyText = doc.slice(qKeyNode?.from, qKeyNode?.to)
        const qOperatorText = doc.slice(qOperatorNode?.from, qOperatorNode?.to)
        const qValueText = doc.slice(qValueNode?.from, qValueNode?.to)

        const qualifier = { key: qKeyText, value: qValueText, operator: qOperatorText };
        const range = { from: node.from, to: node.to };

        const decoration = Decoration.replace({
          inclusiveStart: true,
          inclusiveEnd: true,
          widget: new QualifierWidget(qualifier, range)
        });
        widgets.push(decoration.range(node.from, node.to));
      }
    }
  });
  return Decoration.set(widgets);
}

export const qualifierPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = qualifiers(view);
    }

    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.viewportChanged ||
        syntaxTree(update.startState) != syntaxTree(update.state)
      ) {
        this.decorations = qualifiers(update.view);
      }
    }
  },
  {
    decorations: (instance) => instance.decorations,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.decorations || Decoration.none;
      })
  }
);