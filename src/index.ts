import { dia, shapes, g, linkTools, util, V } from 'jointjs';
import CustomPaper from "./mvc/CustomPaper";
import "./mvc/CustomPaper.css";
import Table, {ITableRow, TableView} from "./elements/Table";

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

const paper = new CustomPaper({
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
	gridSize: 10
} as dia.Paper.Options);
paper.drawGrid({
	color: "#000000",
	name: "mesh",
});

(window as any).paper = paper;

// INIT TOOLS
const zoom_range = document.getElementById("zoom") as HTMLInputElement;
const zoom_label = document.getElementById("zoom_label") as HTMLLabelElement;
const zoom_reset = document.getElementById("zoom_reset") as HTMLButtonElement;

zoom_range.addEventListener("change", (e) => {
	const value = parseFloat((e.target as HTMLInputElement).value);
	zoom_label.innerHTML = value.toFixed(1);
	paper.matrix({
		a: value,
		b: 0,
		c: 0,
		d: value,
		e: 0,
		f: 0
	});
})

zoom_reset.addEventListener("click", () => {
	zoom_range.value = "1";
	zoom_range.dispatchEvent(new Event("change"));
})


for(let i = 0; i < 10; i++) {

	const rows = [];
	for(let j = 0; j < 10; j++) {
		rows.push({id: `row-${j}`, name: `row-${j}`, type: `test-type-${j}`} as ITableRow);
	}

	const table = new Table({
		attrs: {".table_name": {text: "Table_" + i}},
		rows: rows,
		position: {x: 50 + 250 * (i % 5), y: 50 + 350 * Math.floor(i / 5)}
	});
	table.addTo(graph);
}
