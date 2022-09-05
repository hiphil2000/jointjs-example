import { dia, shapes, g, linkTools, util } from 'jointjs';
import Table, {ITableRow, TableView} from "./elements/Table2";

const nameSpace = {
	...shapes,
	erd: {
		Table,
		TableView
	}
}

const graph = new dia.Graph({}, {
	cellNamespace: nameSpace
});

const paper = new dia.Paper({
	el: document.getElementById("app"),
	model: graph,
	cellViewNamespace: nameSpace,
	width: 2000,
	height: 2000,
	interactive: (cellview, event) => {
		if (cellview.model.isElement()) {
			if (cellview.model.attributes["draggable"] === false) {
				return {elementMove: false};
			}
		}

		return true;
	},
    defaultRouter: { name: 'metro' },
});

(window as any).paper = paper;

// paper.on("element:pointerup", function(cell) {
// 	graph.getLinks().forEach(link => {
// 		// @ts-ignore
// 		link.findView(paper).requestConnectionUpdate();
// 	});
// });


for(let i = 0; i < 10; i++) {

	const rows = [];
	for(let j = 0; j < 10; j++) {
		rows.push({id: `row-${j}`, name: `row-${j}`, type: `test-type-${j}`} as ITableRow);
	}

	const table = new Table({
		rows: rows,
		position: {x: 50 + 250 * (i % 5), y: 50 + 350 * Math.floor(i / 5)}
	});
	table.addTo(graph);
}
