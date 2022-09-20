import { dia, linkTools, shapes } from 'jointjs';
import {Table, TableView, ITableRow} from "./elements/table";
import ScrollPaper, { IScrollPaperOptions } from "./mvc/scroll-paper/ScrollPaper";
import CustomManhattanRouter from "./router/CustomManhattanRouter";

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

// INIT PAPER
const paper = new ScrollPaper({
	el: document.getElementById("paper"),
	model: graph,
	cellViewNamespace: nameSpace,
	width: 1000,
	height: 1000,
	// 링크의 Source 혹은 Target 이 Point가 될 수 있는지 여부를 설정합니다.
	// https://resources.jointjs.com/docs/jointjs/v3.5/joint.html#dia.Paper.prototype.options.linkPinning
	// https://groups.google.com/g/jointjs/c/vwGWDFWVDJI
	linkPinning: false,
	// Cell의 Draggable 여부를 처리합니다.
	// 실험적 코드
	interactive: (cellview, event) => {
		if (cellview.model.isElement()) {
			if (cellview.model.attributes["draggable"] === false) {
				return {elementMove: false};
			}
		}	

		return true;
	},
    // defaultRouter: { name: 'orthogonal' },
    defaultRouter: CustomManhattanRouter,
	defaultLink: () => new shapes.standard.Link({
		attrs: {
			line: {
				stroke: "rgb(0, 168, 240)",
				strokeWidth: 2
			}
		},
		connector: { name: "rounded" }
	}),
	validateConnection(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
		// Connection의 유효성을 검사합니다.
		// 참조: https://resources.jointjs.com/tutorial/ports > Linking restriction

		// Source와 Target이 모두 "relation" 인 경우에만 연결합니다.
		const srcRelation = magnetS?.getAttribute("port-group") === "relation";
		const trgRelation = magnetT?.getAttribute("port-group") === "relation";

		return srcRelation && trgRelation;
	},
} as IScrollPaperOptions);

// DRAW GRID
paper.drawGrid({
	color: "#000000",
	name: "mesh",
});


// EVENTS
graph.on("add", (cell: dia.Cell) => {
	if (cell.isLink()) {
		const linkView = cell.findView(paper.paper) as dia.LinkView;
		linkView.addTools(new dia.ToolsView({
			tools: [
				new linkTools.Remove({distance: "10%"}),
			]
		}));

		cell.toBack();
	}
});

// 링크의 하이라이팅 처리
paper.paper.on("link:mouseover", (cellView: dia.CellView) => {
	cellView.model.attr("line/strokeWidth", 4);
});
paper.paper.on("link:mouseout", (cellView: dia.CellView) => {
	cellView.model.attr("line/strokeWidth", 2);
});
paper.paper.on("link:connect", (linkView: dia.LinkView) => {
	console.log(linkView);
});

paper.paper.on("element:pointermove", (cellView: dia.CellView, evt) => {
	console.log("!");
})

// GENERATE TABLES
for(let i = 0; i < 10; i++) {

	const rows = [];
	for(let j = 0; j < 10; j++) {
		rows.push({id: `row-${j}`, name: `row-${j}`, type: `test-type-${j}`} as ITableRow);
	}

	const table = new Table({
		attrs: {".name": {text: "Table_" + i}},
		rows: rows,
		position: {x: 50 + 250 * (i % 5), y: 50 + 350 * Math.floor(i / 5)}
	});
	table.addTo(graph);
}

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