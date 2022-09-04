import { dia, shapes, g, linkTools, util } from 'jointjs';
import DomainElement from "./elements/DomainElement";
import Record from "./elements/Record";
import Table from "./elements/Table";

const nameSpace = {
	...shapes,
	Table
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
    defaultRouter: { name: 'manhattan' },
});

paper.on("element:pointerup", function(cell) {
	graph.getLinks().forEach(link => {
		// @ts-ignore
		link.findView(paper).requestConnectionUpdate();
	});
});


for(let i = 0; i < 10; i++) {
	const table = new Table({
		attrs: {
			title: { text: "Table" + i}
		},
		position: {x: 250 * (i % 5), y: 350 * Math.floor(i / 5)}
	});
	table.addTo(graph);

	for(let j = 0; j < 10; j++) {
		table.addDomain("domain" + j, "TYPE_" + j);
	}
}
