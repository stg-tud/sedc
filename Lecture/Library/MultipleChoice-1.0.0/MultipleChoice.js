/*
   Copyright 2013 Michael Eichberg et al - www.michael-eichberg.de

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

"use strict";

var MultipleChoice = (function () {
    function clickHandler() {
        this.classList.remove('mc-incorrect');
        this.classList.remove('mc-correct');
        var checkbox = this.querySelector('input');
        var explanation = this.querySelector('.mc-explanation');
        explanation.classList.add('hidden');
        if (!checkbox.checked) return;
        if (this.dataset.correct === "true") {
            this.classList.add('mc-correct');
        } else {
            this.classList.add('mc-incorrect');
        }
        explanation.classList.remove('hidden');
        checkbox.blur();
    }

    return {
        /**
         * @param element the id of the element that the question should be added to
         * @param question the question text (HTML formatting allowed)
         * @param answers the answers as a list of JSON objects
         *                Required JSON fields:
         *                   a: the answer text (HTML formatting allowed)
         *                   c: true or false (is the question correct?)
         *                   e: explanation text (HTML formatting allowed)
         */
        showQuestion: function (element, question, answers) {
            var el = document.getElementById(element);
            var questionElement = document.createElement('p');
            questionElement.className = 'mc-question';
            questionElement.innerHTML = question;
            el.appendChild(questionElement);

            var table = document.createElement("div");
            table.className = "mc-answers";
            for (var i = 0; i < answers.length; i++) {
                var answer = answers[i];
                var answerElement = document.createElement('p');
                answerElement.className = 'mc-answer';
                answerElement.dataset.correct = answer.c;
                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                answerElement.appendChild(checkbox);
                var answerText = document.createElement('span');
                answerText.innerHTML = answer.a;
                answerElement.appendChild(answerText);
                var explanationElement = document.createElement('span');
                explanationElement.className = 'mc-explanation hidden';
                explanationElement.innerHTML = answer.e;
                answerElement.appendChild(explanationElement);
                table.appendChild(answerElement);
            }
            el.appendChild(table);
            Gator(document).on("click", ".mc-answer", clickHandler);
        }
    }
})()
