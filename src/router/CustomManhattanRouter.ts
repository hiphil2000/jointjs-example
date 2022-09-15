import { dia, g, routers } from "jointjs";
import { IsPort } from "../utils";

export const enum EDirection {
	LEFT = 0,
	UP = 1,
	RIGHT = 2,
	BOTTOM = 3
}

type Direction = "left" | "top" | "right" | "bottom";
type PortType = "source" | "target";
type LinkStatus = "none" | "connecting" | "connected";

export interface ICustomManhattanArgs {
}

function GetStatus(linkView: dia.LinkView): LinkStatus {
	const source = linkView.model.source();
	const target = linkView.model.target();

	if (IsPort(source) && !IsPort(target)) {
		return "connecting";
	} else if (IsPort(source) && IsPort(target)) {
		return "connected";
	} else {
		return "none";
	}
}

function GetPortDirection(linkView: dia.LinkView, type: PortType): Direction {
	let elem: dia.Element;
	let portId: string;

	if (type === "source") {
		elem = linkView.model.getSourceElement();
		portId = linkView.model.source().port;
	} else if(type === "target") {
		elem = linkView.model.getTargetElement();
		portId = linkView.model.target().port;
	}

	return elem.attributes.ports.groups[elem.getPort(portId).group].position as Direction;
}

function GetPointDirection(linkView: dia.LinkView, type: PortType): Direction {
	const src = linkView.sourceAnchor;
	const trg = linkView.targetAnchor;

	const MINDIST = 30;

	if (trg.y > src.y + MINDIST) {
		return "bottom";
	} else if (trg.y < src.y - MINDIST) {
		return "top";
	} else if (trg.x > src.x) {
		return "right";
	} else {
		return "left";
	}
}

function GetDirection(linkView: dia.LinkView, type: PortType): Direction {
	let connData;

	if (type === "source") {
		connData = linkView.model.source();
	} else {
		connData = linkView.model.target();
	}

	if (IsPort(connData)) {
		return GetPortDirection(linkView, type);
	} else {
		return GetPointDirection(linkView, type);
	}
}

function CustomManhattanRouter(vertices: g.Point[], args: ICustomManhattanArgs, linkView: dia.LinkView): g.PlainPoint[] {
	let result: g.PlainPoint[] = [];
	
	const src = linkView.sourceAnchor;
	const trg = linkView.targetAnchor;

	const srcDir = GetDirection(linkView, "source");
	const trgDir = GetDirection(linkView, "target");

	if (GetStatus(linkView) === "connected") {
		_route(result, src, srcDir, trg, trgDir);
		result = result.reverse().slice(0, result.length - 1);
		console.log(linkView.model.target());
	}
	
	return result;
}

/**
 * draw2d ManhattanConnectionRoute
 * @param vertices Array for store points
 * @param fromPt source point
 * @param fromDir source direction
 * @param toPt target point
 * @param toDir target direction
 * @returns nothing, return to stop recursive
 */
function _route(vertices: g.PlainPoint[], fromPt, fromDir, toPt, toDir) {
    // fromPt is an x,y to start from.
    // fromDir is an angle that the first link must
    //
    const UP = "top";
    const RIGHT = "right";
    const DOWN = "down";
    const LEFT = "left";
	const MINDIST = 20;
	const TOL = 0.1;
	const TOLxTOL = 0.01;

    let xDiff = fromPt.x - toPt.x
    let yDiff = fromPt.y - toPt.y
    let point: g.PlainPoint;
    let dir
    let pos

    if (((xDiff * xDiff) < (TOLxTOL)) && ((yDiff * yDiff) < (TOLxTOL))) {
      vertices.push({
		x: toPt.x,
		y: toPt.y
	  })
      return
    }

    if (fromDir === LEFT) {
      if ((xDiff > 0) && ((yDiff * yDiff) < TOL) && (toDir === RIGHT)) {
        point = toPt
        dir = toDir
      }
      else {
        if (xDiff < 0) {
          point = {x: fromPt.x - MINDIST, y: fromPt.y}
        }
        else if (((yDiff > 0) && (toDir === DOWN)) || ((yDiff < 0) && (toDir === UP))) {
          point = {x: toPt.x, y: fromPt.y}
        }
        else if (fromDir === toDir) {
          pos = Math.min(fromPt.x, toPt.x) - MINDIST
          point = {x: pos, y: fromPt.y}
        }
        else {
          point = {x: fromPt.x - (xDiff / 2), y: fromPt.y}
        }

        if (yDiff > 0) {
          dir = UP
        }
        else {
          dir = DOWN
        }
      }
    }
    else if (fromDir === RIGHT) {
      if ((xDiff < 0) && ((yDiff * yDiff) < TOL) && (toDir === LEFT)) {
        point = toPt
        dir = toDir
      }
      else {
        if (xDiff > 0) {
          point = {x: fromPt.x + MINDIST, y: fromPt.y}
        }
        else if (((yDiff > 0) && (toDir === DOWN)) || ((yDiff < 0) && (toDir === UP))) {
          point = {x: toPt.x, y: fromPt.y}
        }
        else if (fromDir === toDir) {
          pos = Math.max(fromPt.x, toPt.x) + MINDIST
          point = {x: pos, y: fromPt.y}
        }
        else {
          point = {x: fromPt.x - (xDiff / 2), y: fromPt.y}
        }

        if (yDiff > 0) {
          dir = UP
        }
        else {
          dir = DOWN
        }
      }
    }
    else if (fromDir === DOWN) {
      if (((xDiff * xDiff) < TOL) && (yDiff < 0) && (toDir === UP)) {
        point = toPt
        dir = toDir
      }
      else {
        if (yDiff > 0) {
          point = {x: fromPt.x, y: fromPt.y + MINDIST}
        }
        else if (((xDiff > 0) && (toDir === RIGHT)) || ((xDiff < 0) && (toDir === LEFT))) {
          point = {x: fromPt.x, y: toPt.y}
        }
        else if (fromDir === toDir) {
          pos = Math.max(fromPt.y, toPt.y) + MINDIST
          point = {x: fromPt.x, y: pos}
        }
        else {
          point = {x: fromPt.x, y: fromPt.y - (yDiff / 2)}
        }

        if (xDiff > 0) {
          dir = LEFT
        }
        else {
          dir = RIGHT
        }
      }
    }
    else if (fromDir === UP) {
      if (((xDiff * xDiff) < TOL) && (yDiff > 0) && (toDir === DOWN)) {
        point = toPt
        dir = toDir
      }
      else {
        if (yDiff < 0) {
          point = {x: fromPt.x, y: fromPt.y - MINDIST}
        }
        else if (((xDiff > 0) && (toDir === RIGHT)) || ((xDiff < 0) && (toDir === LEFT))) {
          point = {x: fromPt.x, y: toPt.y}
        }
        else if (fromDir === toDir) {
          pos = Math.min(fromPt.y, toPt.y) - MINDIST
          point = {x: fromPt.x, y: pos}
        }
        else {
          point = {x: fromPt.x, y: fromPt.y - (yDiff / 2)}
        }

        if (xDiff > 0) {
          dir = LEFT
        }
        else {
          dir = RIGHT
        }
      }
    }
    _route(vertices, point, dir, toPt, toDir)
    vertices.push(fromPt)
  }

export default CustomManhattanRouter as routers.GenericRouter<"custom-manhattan">;