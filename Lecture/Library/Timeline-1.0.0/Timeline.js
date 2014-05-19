/*
   Copyright 2012 Michael Eichberg et al - www.michael-eichberg.de

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

/**
 * <i>For usage instructions see Timeline.html.</i>
 *
 * @author Michael Eichberg
 */
var Timeline = function () {

    var svgNS = "http://www.w3.org/2000/svg";

    /**
	 r ~ 1.4142. ( The ratio of one of the short sides to the long side
	 in an isosceles triangle.)
	 */
    var r = Math.sqrt(2);

    /**
     * If you rotate a rectangle by (+/-)45 degree, its bounding box will be a square.
     * I.e., the bounding box's width an high is the same.
     */

    function dimensionAfterRotation(w, h) {

        return w / r + h / r;

    }

    return {
        /**
         * @param timeline an array of objects, where each object can set a date property "d"
         * and some text "t". E.g., [&#123;d:"",t:"born"&#125;,&#123;d:"",t:"moved to Vienna"&#125;,&#123;d:"",t:"died"&#125;]
         */
        draw: function (svgElement, timeline) {
            var svg = document.getElementById(svgElement);

            // Phase 1 - creating the elements
            var textNodeMaxWidth = 0;
            var textNodeMaxHeight = 0;
            var dateNodeMaxWidth = 0;
            var dateNodeMaxHeight = 0;
            var textNodes = new Array();
            var dateNodes = new Array();

            for (var i = 0; i < timeline.length; i++) {
                var event = timeline[i];
                var textNode = document.createElementNS(svgNS, "text");
                textNode.setAttribute("class", "timeline-event-description");
                textNodes.push(textNode);
                textNode.appendChild(document.createTextNode(event.t || ""));
                svg.appendChild(textNode);
                textNodeMaxWidth = Math.max(textNodeMaxWidth, textNode.getComputedTextLength());
                textNodeMaxHeight = Math.max(textNodeMaxHeight, parseInt(window.getComputedStyle(
                    textNode).getPropertyValue("line-height").replace("px", "")));

                var dateNode = document.createElementNS(svgNS, "text");
                dateNode.setAttribute("class", "timeline-event-date");
                dateNodes.push(dateNode);
                dateNode.appendChild(document.createTextNode(event.d || ""));
                svg.appendChild(dateNode);
                dateNodeMaxWidth = Math.max(dateNodeMaxWidth, dateNode.getComputedTextLength());
                dateNodeMaxHeight = Math.max(dateNodeMaxHeight, parseInt(window.getComputedStyle(
                    dateNode).getPropertyValue("line-height").replace("px", "")));

            };
            var widthPerEvent = Math.max(dateNodeMaxWidth + dateNodeMaxHeight,
                textNodeMaxHeight * r);
            var dimensionOfText = dimensionAfterRotation(textNodeMaxWidth,
                textNodeMaxHeight);
            var datesBaseLine = dimensionOfText + 2 * dateNodeMaxHeight;

            // Phase 2 - laying out the elements
            var width = 0; /* the width of the image - calculated iteratively */
            for (var i = 0; i < timeline.length; i++) {
                var dateNode = dateNodes[i];
                var dateNodeX = i * widthPerEvent + ((widthPerEvent - dateNode.getComputedTextLength()) /
                    2);
                var dateNodeY = datesBaseLine;
                dateNode.setAttribute("x", dateNodeX);
                dateNode.setAttribute("y", dateNodeY);

                var textNode = textNodes[i];
                var textNodeX = i * widthPerEvent + (widthPerEvent / 2);
                width = Math.max(width, textNodeX + textNode.getComputedTextLength() / r);
                var textNodeY = dimensionOfText;
                textNode.setAttribute("x", textNodeX);
                textNode.setAttribute("y", textNodeY);
                textNode.setAttribute("transform", "rotate(-45," + textNodeX + "," +
                    textNodeY + ")");

                var line = document.createElementNS(svgNS, "line");
                line.setAttribute("class", "timeline-date-line")
                line.setAttribute("x1", textNodeX);
                line.setAttribute("y1", textNodeY + 2);
                line.setAttribute("x2", textNodeX);
                line.setAttribute("y2", dateNodeY - dateNodeMaxHeight - 2);
                svg.appendChild(line);
            }
            width = Math.max(width, i * widthPerEvent);

            var mainTimeline = document.createElementNS(svgNS, "line");
            var mainTimelineY = dimensionOfText + dateNodeMaxHeight / 2;
            mainTimeline.setAttribute("class", "timeline-main");
            mainTimeline.setAttribute("x1", widthPerEvent / 2);
            mainTimeline.setAttribute("y1", mainTimelineY);
            mainTimeline.setAttribute("x2", width);
            mainTimeline.setAttribute("y2", mainTimelineY);
            svg.appendChild(mainTimeline);

            var timelinePrefix = document.createElementNS(svgNS, "line");
            var timelinePrefixY = dimensionOfText + dateNodeMaxHeight / 2;
            timelinePrefix.setAttribute("class", "timeline-prefix");
            timelinePrefix.setAttribute("x1", 0);
            timelinePrefix.setAttribute("y1", timelinePrefixY);
            timelinePrefix.setAttribute("x2", widthPerEvent / 2);
            timelinePrefix.setAttribute("y2", timelinePrefixY);
            svg.appendChild(timelinePrefix);

            var timelineSuffix = document.createElementNS(svgNS, "polygon");
            timelineSuffix.setAttribute("class", "timeline-suffix");
            timelineSuffix.setAttribute("points", width + "," + (mainTimelineY -
                    dateNodeMaxHeight / 3 + 2) + " " + width + "," + (mainTimelineY +
                    dateNodeMaxHeight / 3 - 2) + " " + (width + dateNodeMaxHeight) + "," +
                mainTimelineY);
            svg.appendChild(timelineSuffix);

            svg.setAttribute("width", width + dateNodeMaxHeight);
            svg.setAttribute("height", datesBaseLine + dateNodeMaxHeight);
        }
    };

}();
