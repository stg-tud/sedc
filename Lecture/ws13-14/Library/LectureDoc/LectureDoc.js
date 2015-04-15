/*
 *   Copyright 2012 Michael Eichberg et al - www.michael-eichberg.de
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/*
 * The following script turns a browser in a fully-fledged presentation
 * program (if the browser has a presentation mode/a chromeless mode).
 * The basic idea is that we render a standard HTML document that uses some
 * predefined CSS classes as a set of slides.
 *
 * The idea is that all SECTION elements where the CLASS attribute contains
 * "slide" are rendered as single slides and the user can change the slides
 * using the standard controls (left, right keys etc.) known from other
 * presentation programs.
 *
 * @author Michael Eichberg
 * @author Marco Jacobasch
 * @author Arne Lottmann
 * @author Daniel Killer
 * @author Kerstin Reifschläger
 * @author Simone Wälde
 * @author David Becker
 * @author Tobias Becker
 * @author Andre Pacak
 * @author Volkan Hacimüftüoglu
 */

"use strict";

/**
 * The LectureDoc object. Takes care of initializing state, registering global
 * listeners, and starting the UI in the right order.
 * @namespace LectureDoc
 */
var LectureDoc = function () {
    /*
     * This is deliberately kept out of the state so that in case there's a problem
     * with the state, debugging won't be affected.
     */
    var debug_OFF = 0,
        debug_ERROR = -1,
        debug_WARNING = -2,
        debug_INFO = -3,
        debug_TRACE = -4,
        debug_ALL = -2147483648;
    var debug = debug_OFF;

    /**
     * Logs something (to the console).
     * @param {*} something whatever you want
     * @param {?Number} loglevel the log level for this message.
     * @memberof LectureDoc
     */

    function log(something, loglevel) {
        if (loglevel == undefined) {
            loglevel = debug_INFO;
        }
        if (debug > loglevel) return;
        console.log(something);
    }

    /**
     * Transforms a triple of key, old value, and new value to a string.
     * @param {*} key the key
     * @param {*} oldValue the old value
     * @param {*} newValue the new value
     * @return [String]
     */

    function debugString(key, oldValue, newValue) {
        return key + ": " + oldValue + " --> " + newValue;
    }

    /**
     * Transforms an object into a JSON style string, but does not recurse
     * (unlike JSON.stringify). Needed because JSON.stringify fails with
     * self-referencing structures like HTML nodes.
     */

    function stringify(object) {
        return "{" +
            Object.keys(object).map(function (key) {
                return '"' + key + '":"' + object[key] + '"';
            }).join(",") + "}";
    }

    /**
     * A collection that does not contain duplicate values.
     * @param initialItems the initial content of the new Set.
     * Contained duplicate elements will only be added once.
     * @class Set
     */

    function Set(initialItems) {
        /**
         * The actual container of the elements of this set.
         * @memberof Set
         * @instance
         */
        var items = [];
        /**
         * Adds the given item to this Set unless it is already in it.
         * @param item the item to add
         * @memberof Set
         * @instance
         */

        function add(item) {
            if (!set.contains(item)) {
                items.push(item);
            }
        };
        this.add = add;
        /**
         * Check if the given item is in this Set.
         * @param value the item to check
         * @return {Boolean} true if <code>item</code> is in this Set, false otherwise.
         * @memberof Set
         * @instance
         */

        function contains(item) {
            return items.reduce(function (found, i) {
                return found || i === item;
            }, false);
        };
        this.contains = contains;
        /**
         * Returns the number of elements in this set.
         * @return {Number} the number of elements in this set.
         * @memberof Set
         * @instance
         */

        function size() {
            return items.length;
        };
        this.size = size;
        /**
         * Executes the given function for each item in the set.
         * @param {Function} f
         * @memberof Set
         * @instance
         */

        function forEach(f) {
            items.forEach(f);
        };
        this.forEach = forEach;
        var set = this;
        if (Array.isArray(initialItems)) {
            initialItems.forEach(function (item) {
                set.add(item);
            });
        }
    };

    /**
     * Offers methods for registering and notifying listeners for arbitrary properties.
     * @class ListenerHelper
     */

    function ListenerHelper() {
        // listeners interested in changes to all properties are stored here
        var allPropertiesListeners = [];
        // listeners interested in changes to only some properties are stored
        // here; keys are the property names, values the lists of listeners
        // interested in changes to that specific property
        var specificPropertiesListeners = {};

        /**
         * Represents a changed property.
         * @typedef ModifiedProperty
         * @type {object}
         * @property {*} newValue the property's new value
         * @property {*} oldValue the property's old value
         * @memberof ListenerHelper
         * @inner
         */
        /**
         * Represents a set of altered properties.
         * All properties must be pairs of <code>keyname</code> : {@link ModifiedProperty}.
         * @typedef ModifiedProperties
         * @type {object}
         * @memberof ListenerHelper
         * @inner
         */
        /**
         * A Listener is notified of changes by a ListenerHelper.
         * @callback Listener
         * @param source the object on which the change occurred
         * @param {ModifiedProperties} modifiedProperties the source's properties that have changed
         * @memberof ListenerHelper
         * @inner
         */
        /**
         * Registers a listener for a set of properties.
         * @param {Listener} listener the listener
         * @param {{undefined|string|Array<string>}} properties the properties the listener is interested in.
         * if undefined, the listener will be notified of all property changes.
         * @memberof ListenerHelper
         * @instance
         */

        function addListener(listener, properties) {
            if (typeof listener !== "function") return;
            if (typeof properties === "string") properties = [properties];
            if (Array.isArray(properties)) {
                properties.forEach(function (p) {
                    if (p in specificPropertiesListeners) {
                        specificPropertiesListeners[p].push(listener);
                    } else {
                        specificPropertiesListeners[p] = [listener];
                    }
                });
            } else {
                allPropertiesListeners.push(listener);
            }
        };
        this.addListener = addListener;
        /**
         * Notifies all listeners that are interested in changes to any of the given properties.
         * @param source the object whose properties changed
         * @param {ModifiedProperties} modifiedProperties
         * @memberof ListenerHelper
         * @instance
         */

        function notifyListeners(source, modifiedProperties) {
            if (Object.keys(modifiedProperties).length === 0) return;
            var listenersToNotify = new Set(allPropertiesListeners);
            for (var key in modifiedProperties) {
                if (key in specificPropertiesListeners) {
                    specificPropertiesListeners[key].forEach(function (listener) {
                        listenersToNotify.add(listener);
                    });
                }
            }
            if (debug <= debug_INFO) {
                if (Object.keys(modifiedProperties).length > 0) {
                    log("ListenerHelper: notifying " + listenersToNotify.size() +
                        " listener(s) about the following " +
                        Object.keys(modifiedProperties).length +
                        " change(s):\n" + stringify(modifiedProperties));
                }
            }
            var results = {};
            var debug_requestingListenersCounter = 0;
            listenersToNotify.forEach(function (listener) {
                var changes = listener(source, modifiedProperties);
                if (debug <= debug_INFO) {
                    if (changes && Object.keys(changes).length > 0) {
                        debug_requestingListenersCounter++;
                    }
                }
                results = Util.merge(results, changes);
            });
            if (debug <= debug_INFO) {
                if (results && Object.keys(results).length > 0) {
                    log("ListenerHelper: " + debug_requestingListenersCounter +
                        " out of " + Object.keys(listenersToNotify).length +
                        " listener(s) request(s) the following " +
                        Object.keys(results).length + " change(s):\n" +
                        stringify(results));
                }
            }
            return results;
        };
        this.notifyListeners = notifyListeners;
    };

    /**
     * This is LectureDoc's global state. You can set and get properties and
     * register listeners to be notified when some (or all) properties change.
     * You can also add constraints to limit the possible values of properties.
     * <br>
     * Property changes are made up by passing a map of properties to the update
     * method.
     * <br>
     * If listeners wish to update some properties based on a processed event,
     * they need to return a map of the changes they want to make. The changes
     * requested by all listeners will be merged and applied after all listeners
     * have been notified of the previous changes.
     * @namespace State
     */
    var State = function () {
        /**
         * The application state. Persistent data is located here.
         * @memberof State
         * @namespace applicationState
         */
        var applicationState = {
            /**
             * LectureDoc's current rendering mode.
             * @type {String}
             * @memberof State.applicationState
             * @inner
             */
            mode: "document",
            /**
             * The slide that is (or would be) shown in presentation mode.
             * @type {Number}
             * @memberof State.applicationState
             * @inner
             */
            currentSlide: -1,
            /**
             * Indicates whether the user has acknowledged the position of the menu button.
             * @type {Boolean}
             * @memberof State.applicationState
             * @inner
             */
            doNotShowMenuHint: false,
            /**
             * The factor to scale slides on the light table by.
             * @type {Number}
             * @memberof State.applicationState
             * @inner
             */
            lightTableZoomFactor: 0.25,
            /**
             * The amount that slides are (or would be) zoomed by in presentation mode.
             * 1=100%.
             * @type {Number}
             * @memberof State.applicationState
             * @inner
             */
            presentationZoomFactor: 1,
        };
        /**
         * The application state. Volatile data is located here.
         * @memberof State
         * @namespace sessionState
         */
        var sessionState = {
            /**
             * A clone of the unmodified document's body element.
             * @type {HTMLElement}
             * @memberof State.sessionState
             * @inner
             */
            theDocumentBody: undefined,
            /**
             * A list of slide elements ("section.slide") that are defined on
             * {@link theDocumentBody}.
             * @type {Array<HTMLElement>}
             * @memberof State.sessionState
             * @inner
             */
            theSlides: undefined,
            /**
             * A list of headers outside slides, the table of contents
             * @type {Array<HTMLElement>}
             * @memberof State.sessionState
             * @inner
             */
            theTableOfContents: undefined,
            /**
             * Unix timestamp of the current document's last modification.
             * @type {Number}
             * @memberof State.sessionState
             * @inner
             */
            lastModified: null,
            /**
             * A list of lists of HTML a elements that represent links to HTML
             * aside elements.
             * The indices of the outer list correspond to slide indices.
             * @type {Array<Array<HTMLElement>>}
             * @memberof State.sessionState
             * @inner
             */
            slideAsides: undefined,
            /**
             * The HTML content that is shown in the help dialog.
             * @type {HTMLElement}
             * @memberof State.sessionState
             * @inner
             */
            helpNode: undefined,
            /**
             * Internal state used for entering arbitrary number sequences to
             * jump to slides.
             * @type {?String}
             * @memberof State.sessionState
             * @inner
             */
            enteredSlideNumber: null,
            /**
             * Indicates whether the overlay layer is active or not.
             * @type {Boolean}
             * @memberof State.sessionState
             * @inner
             */
            isOverlayActive: false,
            /**
             * The color of the overlay layer when active. Must be either
             * "black" or "white".
             * @type {String}
             * @memberof State.sessionState
             * @inner
             */
            overlayLayerColor: "black",
            /**
             * Indicates whether a modal dialog is shown or not.
             * @type {Boolean}
             * @memberof State.sessionState
             * @inner
             */
            isModalDialogActive: false,
            /**
             * The width of a single slide.
             * @type {Number}
             * @memberof State.sessionState
             * @inner
             */
            slideWidth: 0,
            /**
             * The height of a single slide.
             * @type {Number}
             * @memberof State.sessionState
             * @inner
             */
            slideHeight: 0,
            /**
             * The aspect ratio of a single slide (slideWidth/slideHeight).
             * @type {Number}
             * @memberof State.sessionState
             * @inner
             */
            slideAspectRatio: 0,
            /**
             * Indicates whether the menu bar is visible.
             * @type {Boolean}
             * @memberof State.sessionState
             * @inner
             */
            isMenubarVisible: true,
            /**
             * Indicates if drawing is enabled. Is only used for touchscreen devices.
             * @type {Boolean}
             * @memberof State.sessionState
             * @inner
             */
            isTouchDrawingEnabled: false,
        };

        var listeners = new ListenerHelper();
        var constraints = {};
        /**
         * Used to implement constraints on properties.
         * @typedef Constraint
         * @type {Object}
         * @property {Constraint#Validate} validate the function used to
         * determine validity
         * @property {Constraint#Fail} onFail the function to call if validation
         * fails (e.g. to display a custom error message)
         * @memberof State
         * @inner
         */
        /**
         * Validates an impending change to a property.
         * @callback Validate
         * @param {String} key the name of the property to be changed
         * @param {*} newValue the value intended to be assigned to the property
         * @param {*} oldValue property's current value
         * @return {Boolean} true if the new value is valid, false if not
         * @memberof State
         * @inner
         */
        /**
         * Is called when the corresponding validation fails.
         * @callback Fail
         * @param {String} key the name of the property to be changed
         * @param {*} newValue the value intended to be assigned to the property
         * @param {*} oldValue property's current value
         * @memberof State
         * @inner
         */
        /**
         * Validates the new value for the named property, based on the given
         * constraints.
         * @param {String} key the property's name
         * @param {*} newValue the property's intended new value
         * @param {*} oldValue the property's current value
         * @param {Array<Constraint>} constraints the constraints to check
         * @return {Boolean} true if all constraints accept the new value, false
         * if at least one does not
         * @memberof State
         * @inner
         */

        function validate(key, newValue, oldValue, constraints) {
            log("State: validating " + debugString(key, oldValue, newValue), debug_TRACE);
            return !constraints || constraints.reduce(function (result, constraint) {
                var validate = constraint.validate || constraint;
                var pass = validate(key, newValue, oldValue);
                if (!pass && constraint.onFail) {
                    constraint.onFail(key, newValue, oldValue);
                }
                return result && pass;
            }, true);
        }

        var runningUpdatesCounter = 0;
        /**
         * @namespace State
         */
        var object = {
            /**
             * @see ListenerHelper#addListener
             * @memberof State
             * @inner
             */
            addListener: listeners.addListener,
            /**
             * Registers a new constraint.
             * @param {String} key the name of the property to register the
             * constraint for
             * @param {Constraint#Validate} validate the validation function
             * @param {Constraint#Fail} onFail the failure function
             * @memberof State
             * @inner
             */
            addConstraint: function (key, validate, onFail) {
                if (typeof validate !== "function") return;
                var constraint = onFail && (typeof onFail === "function") ? {
                    validate: validate,
                    onFail: onFail
                } : validate;
                if (key in constraints) {
                    constraints[key].push(constraint);
                } else {
                    constraints[key] = [constraint];
                }
                log("State: registered constraint for property " + key);
            },
            /**
             * Returns the value of the named property.
             * @param key the property's name
             * @return the property's value (possibly undefined)
             * @memberof State
             * @inner
             */
            get: function (key) {
                if (key in applicationState) {
                    var value = applicationState[key];
                    log("State: reading application state: " + key + " = " +
                        value, debug_TRACE);
                    return applicationState[key];
                } else {
                    var value = sessionState[key];
                    if (!(key in sessionState)) {
                        log("State: reading unknown variable " + key,
                            debug_ERROR);
                    }
                    log("State: reading session state: " + key + " = " + value,
                        debug_TRACE);
                    return value;
                }
            },
            /**
             * Returns a copy of the application state object.
             * @memberof State
             * @inner
             */
            getApplicationState: function () {
                return Util.merge({}, applicationState);
            },
            /**
             * Applies the property changes contained in the given settings object.
             * Each property change is validated by its constraints prior to
             * being applied.
             * <br>
             * When all changes have been made, registered listeners are notified
             * of the changes.
             * Their return values are then collected and, if any of them requested
             * more changes, applied.
             * @param {Object} settings the property changes
             * @memberof State
             * @inner
             */
            update: function (settings) {
                log("State: entering update section");
                if (runningUpdatesCounter) {
                    log("State: re-entering update section while updating",
                        debug_WARNING);
                }
                runningUpdatesCounter++;
                var debug_passCounter = 0;
                while (settings) {
                    log("State: update pass " + (++debug_passCounter));
                    var modifiedProperties = {};
                    for (var key in settings) {
                        var newValue = settings[key];
                        var oldValue = this.get(key);
                        if (newValue === oldValue) {
                            log("State: update suppressed (unchanged value): " +
                                debugString(key, oldValue, newValue), debug_TRACE);
                            continue;
                        }
                        if (!validate(key, newValue, oldValue, constraints[key])) {
                            log("State: update suppressed (validation failed): " +
                                debugString(key, oldValue, newValue), debug_ERROR);
                            continue;
                        }
                        modifiedProperties[key] = {
                            oldValue: oldValue,
                            newValue: newValue
                        };
                        if (key in applicationState) {
                            log("State: updating application state: " +
                                debugString(key, oldValue, newValue));
                            applicationState[key] = newValue;
                        } else { // new variables are stored in the session state
                            if (!(key in sessionState)) {
                                log("State: new variable introduced: " + key,
                                    debug_WARNING);
                            }
                            log("State: updating session state: " +
                                debugString(key, oldValue, newValue));
                            sessionState[key] = newValue;
                        }
                    }
                    settings = listeners.notifyListeners(this, modifiedProperties);
                }
                runningUpdatesCounter--;
                log("State: leaving update section after " + debug_passCounter +
                    " pass(es)");
            },
        };
        return object;
    }();


    /**
     * If this callback is triggered through an event (e.g. keypress or mouseclick),
     * that event will be the parameter. Programmatic calls may pass arbitrary
     * parameters or even none.
     * @callback Execute
     * @memberof Action
     * @inner
     */
    /**
     * An Action encapsulates several display and activity attributes together
     * with key strokes and a function.
     * <br>
     * All constructor parameters can be either constant values or functions. If
     * they are functions, they will be reevaluated whenever a change to the global
     * {@link State} occurs. If these reevaluations result in changes, registered
     * {@link ListenerHelper#Listener}s will be notified of these changes.
     * <br>
     * Hint: it is similar to Java's <code>AbstractAction</code>.
     *
     * @param {Boolean|Function} isEnabled indicates whether the Action can be
     * executed
     * @param {String|Function} getLabel what should be the Action's label, e.g.
     * in a button
     * @param {String|Function} getIcon the name or path of the icon that should
     * be used to represent this Action
     * @param {String|Function} getId the Action's identifying name
     * @param {Action.Execute} execute the Action's <em>action</em>
     * @param {Array<String>|Function} getKeyStrokes a list of key strokes that
     * should trigger the Action
     * @param {Boolean|Function} isVisible indicates whether the Action's visual
     * representation should be visible
     * @param {Boolean|Function} isActive indicates whether the Action's visual
     * representation should be rendered as active
     * @class Action
     */

    function Action(isEnabled, getLabel, getIcon, getId, execute, getKeyStrokes,
        isVisible, isActive) {
        var listeners = new ListenerHelper();

        function getValue(producer) {
            return (typeof producer === "function") ? producer() : producer;
        }
        this.isEnabled = getValue(isEnabled);
        this.isVisible = getValue(isVisible);
        this.isActive = getValue(isActive);
        this.getLabel = getValue(getLabel);
        this.getIcon = getValue(getIcon);
        this.getId = getValue(getId);
        this.getKeyStrokes = getValue(getKeyStrokes);
        var action = this;
        this.execute = function () {
            if (action.isEnabled) {
                execute.apply(action, arguments);
            }
        };
        this.addListener = listeners.addListener;
        /**
         * Checks if any properties have changed and if so, notifies registered listeners.
         * @memberof Action
         */
        this.update = function () {
            function updateIfChanged(propertyName, producer, modifiedProperties) {
                if (typeof producer !== "function") {
                    return;
                }
                log("Action: prepare to update " + propertyName + " of action " + getId,
                    debug_TRACE);
                var newValue = producer();
                if (action[propertyName] !== newValue) {
                    modifiedProperties[propertyName] = {
                        oldValue: action[propertyName],
                        newValue: newValue
                    };
                    action[propertyName] = newValue;
                    log("Action: updating action state: " + debugString(propertyName,
                        modifiedProperties[propertyName].oldValue, newValue));
                } else {
                    log("Action: update suppressed (unchanged value): " +
                        debugString(propertyName, action[propertyName], newValue),
                        debug_TRACE);
                }
            }
            var modifiedProperties = {};
            updateIfChanged("isEnabled", isEnabled, modifiedProperties);
            updateIfChanged("getLabel", getLabel, modifiedProperties);
            updateIfChanged("getIcon", getIcon, modifiedProperties);
            updateIfChanged("getId", getId, modifiedProperties);
            updateIfChanged("getKeyStrokes", getKeyStrokes, modifiedProperties);
            updateIfChanged("isVisible", isVisible, modifiedProperties);
            updateIfChanged("isActive", isActive, modifiedProperties);
            listeners.notifyListeners(action, modifiedProperties);
        };
        State.addListener(this.update);
    };

    /**
     * Implementation of the builder pattern for {@link Action}s.
     * @param {String} id the Action's id
     * @see Action
     * @class ActionBuilder
     */

    function ActionBuilder(id) {
        var m_enabled = true;
        var m_label = "";
        var m_icon = "";
        var m_id = id || "";
        var m_execute = function () {};
        var m_keyStrokes = undefined;
        var m_visible = true;
        var m_active = false;

        /**
         * Sets the function that determines whether the action is enabled or
         * not at a particular time.
         * @param {function} enabled the enabled function.
         * @memberof ActionBuilder
         * @instance
         */

        function setEnabled(enabled) {
            m_enabled = enabled;
            return this;
        };
        this.setEnabled = setEnabled;
        /**
         * Sets the function that determines the label to use at a particular
         * time.
         * @param {function} label the label function.
         * @memberof ActionBuilder
         * @instance
         */

        function setLabel(label) {
            m_label = label;
            return this;
        };
        this.setLabel = setLabel;
        /**
         * Sets the function that determines the icon to use at a particular
         * time.
         * @param {function} icon the icon function.
         * @memberof ActionBuilder
         * @instance
         */

        function setIcon(icon) {
            m_icon = icon;
            return this;
        };
        this.setIcon = setIcon;
        /**
         * Sets the id of the action to build.
         * @param {function} id the id.
         * @memberof ActionBuilder
         * @instance
         */

        function setId(id) {
            m_id = id;
            return this;
        };
        this.setId = setId;
        /**
         * Sets the function that is executed if the action is executed.
         * @param {function} execute the function to execute.
         * @memberof ActionBuilder
         * @instance
         */

        function setExecute(execute) {
            m_execute = execute;
            return this;
        };
        this.setExecute = setExecute;
        /**
         * Sets the function that determines the available keystrokes at a
         * particular time.
         * @param {function} keyStrokes the key strokes function.
         * @memberof ActionBuilder
         * @instance
         */

        function setKeyStrokes(keyStrokes) {
            m_keyStrokes = keyStrokes;
            return this;
        };
        this.setKeyStrokes = setKeyStrokes;
        /**
         * Sets the function that determines whether the UI components for this
         * action are visible or not at a particular time.
         * @param {function} visible the visible function.
         * @memberof ActionBuilder
         * @instance
         */

        function setVisible(visible) {
            m_visible = visible;
            return this;
        };
        this.setVisible = setVisible;
        /**
         * Sets the function that determines whether the UI components for this
         * action are highlighted as active or not at a particular time.
         * @param {function} active the active function.
         * @memberof ActionBuilder
         * @instance
         */

        function setActive(active) {
            m_active = active;
            return this;
        };
        this.setActive = setActive;
        /**
         * Builds a new Action from this ActionBuilder.
         * @memberof ActionBuilder
         * @instance
         */

        function buildAction() {
            return new Action(m_enabled, m_label, m_icon, m_id, m_execute, m_keyStrokes,
                m_visible, m_active);
        };
        this.buildAction = buildAction;
    };

    /**
     * Manages LectureDoc's different rendering modes.
     * @namespace Renderer
     */
    var Renderer = function () {
        /**
         * Resets the document and any transient state.
         * @memberof Renderer
         */

        function clear() {
            Menubar.hideAllSubmenus();
            Util.bodyContent().innerHTML = "";
            document.body.className = "";
            document.body.style.minWidth = "";
            document.body.style.height = "";
            State.update({
                isOverlayActive: false,
                enteredSlideNumber: null
            });
        }

        /**
         * @namespace Renderer
         */
        return {
            /**
             * render renders the mode's representation
             * @typedef Mode
             * @type {Object}
             * @property {String} className the class name to set on the HTML
             * body element
             * @property {String} name the Mode's human readable name
             * @property {Function}
             * @memberof Renderer
             * @inner
             */
            /**
             * All values must be of type {@link Renderer.Mode}.
             * @type {Object}
             * @memberof Renderer
             * @inner
             * @namespace modes
             */
            modes: {},
            /**
             * Renders the mode's representation.
             * @param {String} mode the name of the mode to render
             * @memberof Renderer
             * @inner
             */
            render: function (mode) {
                var renderer = this.modes[mode];
                log("Renderer: rendering " + renderer.name);
                clear();
                document.body.className = renderer.className;
                renderer.render();
            },
            /**
             * Initializes the renderer.
             * @memberof Renderer
             * @inner
             */
            initialize: function () {
                log("Renderer: initializing renderer")
                /**
                 * @memberof Renderer.modes
                 * @namespace document
                 */
                Renderer.modes.document = function () {
                    var contentClone = State.get("theDocumentBody").querySelector(
                        "#body-content").cloneNode(true);
                    // moves asides with titles that are placed on slides (and normally 
                    // would be hidden) into the document flow behind the slide they
                    // were defined on
                    Util.toArray(contentClone.querySelectorAll("section.slide")).forEach(
                        function (slide, i) {
                            var slideParent = slide.parentNode;
                            var toInsertBefore = slide.nextSibling;
                            Util.toArray(slide.querySelectorAll(
                                ".section-body>aside[data-title]"))
                                .forEach(function (aside) {
                                    slide.parentNode.insertBefore(aside,
                                        toInsertBefore);
                                });
                        });
                    return {
                        className: "",
                        name: "Document",
                        render: function () {
                            Util.bodyContent().innerHTML = contentClone.innerHTML;
                        }
                    };
                }();
                /**
                 * @memberof Renderer.modes
                 * @namespace presentation
                 */
                Renderer.modes.presentation = function () {
                    /**
                     * Sets the list of links to asides as described in the
                     * State property <code>asidesList</code>.
                     * @see State
                     * @memberof Renderer.modes.presentation
                     */

                    function initializeAsides(slides) {
                        var asidesList = [];
                        slides.forEach(function (slide) {
                            var asides = Util.toArray(slide.querySelectorAll(
                                ".section-body>aside[data-title]"));
                            asidesList.push(asides.map(function (aside) {
                                var asideButton = Menubar.createTextButton(
                                    new ActionBuilder().setLabel(function () {
                                        if (aside.classList.contains(
                                            "visible")) {
                                            return aside.dataset.title +
                                                " ✦";
                                        } else {
                                            return aside.dataset.title;
                                        }
                                    }).setExecute(function () {
                                        aside.classList.toggle("visible");
                                        this.update();
                                    }).buildAction());
                                return asideButton;
                            }));
                        });
                        State.update({
                            "slideAsides": asidesList
                        });
                    };

                    function initializeLaserPointer() {
                        var theLaserPointer = document.createElement("div");
                        theLaserPointer.id = "ldjs-laserpointer";

                        document.body.addEventListener('mousemove', function (event) {
                            if (event.ctrlKey && Util.isInPresentationMode()) {
                                // When the slide was changed the laser pointer may belong to
                                // the wrong section element; i.e. a section element belonging
                                // to a slide that is not shown; repair if necessary.
                                if (theLaserPointer.parentNode !== document.body) {
                                    document.body.insertBefore(theLaserPointer,
                                        document.body.firstChild);
                                }
                                theLaserPointer.style.left = event.clientX + "px";
                                theLaserPointer.style.top = event.clientY + "px";
                                theLaserPointer.style.visibility = "visible";
                                event.preventDefault();
                            } else {
                                theLaserPointer.style.visibility = "hidden";
                            }
                        }, false);
                        document.body.addEventListener('touchmove', function (event) {

                            if (PresentationTouchHandler.isLaserPointerActive() &&
                                Util.isInPresentationMode()) {
                                // When the slide was changed the laser pointer may belong to
                                // the wrong section element; i.e. a section element belonging
                                // to a slide that is not shown; repair if necessary.

                                if (theLaserPointer.parentNode !== document.body) {
                                    document.body.insertBefore(theLaserPointer,
                                        document.body.firstChild);
                                }
                                theLaserPointer.style.left = event.touches[0].clientX +
                                    "px";
                                theLaserPointer.style.top = event.touches[0].clientY +
                                    "px";
                                theLaserPointer.style.visibility = "visible";
                                event.preventDefault();
                            }

                        }, false);
                        document.body.addEventListener('touchend', function (event) {
                            theLaserPointer.style.visibility = "hidden";
                        }, false);
                    };

                    function addCanvasLayer(slide) {
                        var canvas = document.createElement("div");
                        canvas.className = "ldjs-canvas";
                        var slideBody = slide.querySelector("div.section-body");
                        slideBody.insertBefore(canvas, slideBody.firstChild);

                        var svg = document.createElementNS("http://www.w3.org/2000/svg",
                            "svg");
                        canvas.appendChild(svg);

                        canvas.dataset.strokeColor = "black";
                        var x = -1; // stores the x position of the mouse/finger (when we receive a mousemove/touchmove event)
                        var y = -1; // stores the y position of the mouse/finger (when we receive a mousemove/touchmove event)

                        // The mouse move event listener is added to the slide and not the canvas
                        // because the canvas(svg) is configured to not intercept mouse events to
                        // enable users to,e.g., still click on links even if the canvas is shown.
                        // CSS Property:     svg{ pointer-events: none }.
                        slide.addEventListener("mousemove", function (event) {
                            if (event.shiftKey && canvas.classList.contains("visible")) {
                                var scrollPosition = Util.getScrollPosition();
                                var new_x = event.clientX + scrollPosition.left -
                                    slide.offsetLeft;
                                var new_y = event.clientY + scrollPosition.top -
                                    slide.offsetTop;
                                var scale = parseFloat(State.get(
                                    "presentationZoomFactor")) ||
                                    1;
                                new_x = new_x / scale;
                                new_y = new_y / scale;
                                if (x >= 0 && (new_x !== x || new_y !== y)) {
                                    var line = document.createElementNS(
                                        "http://www.w3.org/2000/svg", "line");
                                    line.setAttribute("stroke", canvas.dataset.strokeColor);
                                    line.setAttribute("stroke-width", "3");
                                    line.setAttribute("x1", x);
                                    line.setAttribute("y1", y);
                                    line.setAttribute("x2", new_x);
                                    line.setAttribute("y2", new_y);
                                    svg.appendChild(line);
                                }
                                x = new_x;
                                y = new_y;
                            } else {
                                x = -1;
                                y = -1;
                            }
                            return false;
                        });
                        //checks if the device has a touchscreen.
                        if ( !! ('ontouchstart' in window)) {
                            slide.addEventListener("touchend", function (event) {
                                x = -1;
                                y = -1;
                            });

                            slide.addEventListener("touchmove", function (event) {
                                var canvas = Util.bodyContent().querySelector(
                                    ".slide.current .ldjs-canvas");
                                if (!canvas) return;
                                var visible = canvas.classList.contains("visible");
                                if (visible && !Util.isNavigationableInPresentationMode() &&
                                    event.touches.length == 1) {
                                    var scrollPosition = Util.getScrollPosition();
                                    var new_x = event.touches[0].clientX +
                                        scrollPosition.left -
                                        slide.offsetLeft;
                                    var new_y = event.touches[0].clientY +
                                        scrollPosition.top -
                                        slide.offsetTop;
                                    var scale = parseFloat(State.get(
                                        "presentationZoomFactor")) ||
                                        1;
                                    new_x = new_x / scale;
                                    new_y = new_y / scale;
                                    if (x >= 0 && (new_x !== x || new_y !== y)) {
                                        var line = document.createElementNS(
                                            "http://www.w3.org/2000/svg", "line");
                                        line.setAttribute("stroke", canvas.dataset.strokeColor);
                                        line.setAttribute("stroke-width", "3");
                                        line.setAttribute("x1", x);
                                        line.setAttribute("y1", y);
                                        line.setAttribute("x2", new_x);
                                        line.setAttribute("y2", new_y);
                                        svg.appendChild(line);
                                    }
                                    x = new_x;
                                    y = new_y;
                                    event.preventDefault();
                                    event.stopPropagation();
                                } else {
                                    x = -1;
                                    y = -1;
                                }
                                return false;
                            });
                        }
                    };
                    var slides = State.get("theSlides").map(function (slide, index) {
                        var clone = slide.cloneNode(true);
                        addCanvasLayer(clone);
                        return clone;
                    });
                    var lastSlide = document.createElement("section");
                    lastSlide.id = "ldjs-end-of-presentation";
                    lastSlide.innerHTML = "<p>End of presentation</p>";
                    slides.push(lastSlide);

                    initializeLaserPointer();
                    initializeAsides(slides);
                    PresentationTouchHandler.initialize();

                    function showSlide(slideIndex) {
                        var slide = slides[slideIndex];
                        log("Renderer: showing slide #" + slideIndex + ": " + slide,
                            debug_TRACE);
                        if (!slide) {
                            log("Renderer: slide #" + slideIndex +
                                " not found, abort", debug_ERROR);
                            return;
                        }
                        slide.classList.add("current");
                        return {
                            isOverlayActive: false
                        };
                    };

                    function hideSlide(slideIndex) {
                        var slide = slides[slideIndex];
                        log("Renderer: hiding slide #" + slideIndex + ": " + slide,
                            debug_TRACE);
                        if (!slide) {
                            return;
                        }
                        slide.classList.remove("current");
                    };

                    function zoom() {
                        if (!Util.isInPresentationMode()) return;
                        var factor = State.get("presentationZoomFactor");
                        log("Renderer: zoom to factor " + factor + " (presentation)");
                        var transform = 'scale(%zoom,%zoom)'.replace(/%zoom/g, factor);
                        var width = (State.get("slideWidth") * factor) + 'px';
                        var height = (State.get("slideHeight") * factor) + 'px';
                        // skip end of presentation slide (last one in slides array)
                        Util.toArray(slides.slice(0, slides.length - 1)).forEach(function (
                            slide) {
                            if (slide === lastSlide) return;
                            slide.style.width = width;
                            slide.style.height = height;
                            if (parseInt(width) < window.innerWidth) {
                                // only try to center if the slide is smaller than the window
                                slide.style.marginLeft = (-parseInt(width) / 2) +
                                    "px";
                                slide.style.left = "50%";
                            } else {
                                // otherwise just align it top left
                                slide.style.marginLeft = "0";
                                slide.style.left = "0";
                            }
                            var slideBody = slide.querySelector('div.section-body');
                            slideBody.style.transform = transform;
                            slideBody.style.WebkitTransform = transform;
                            slideBody.style.transformOrigin = '0 0';
                            slideBody.style.WebkitTransformOrigin = '0 0';
                        });
                        document.body.style.minWidth = width;
                        document.body.style.height = height;
                        Util.manageScrollbars();
                        Util.setScrollPosition(0, 0);
                    }
                    State.addListener(zoom, "presentationZoomFactor");

                    State.addListener(function (state, modifiedProperties) {
                        log("Renderer: switching slide: " +
                            modifiedProperties.currentSlide.oldValue + " --> " +
                            modifiedProperties.currentSlide.newValue);
                        var changes = showSlide(modifiedProperties.currentSlide.newValue);
                        hideSlide(modifiedProperties.currentSlide.oldValue);
                        return changes;
                    }, "currentSlide");

                    // recalculate the slides' position when the window is resized
                    // center only if the window is wider than the slide; otherwise align
                    // the slide with the window's top left corner
                    Gator(window).on("resize", function () {
                        if (Util.isInPresentationMode()) {
                            var documentWidth = parseInt(document.body.style.minWidth);
                            var marginLeft = "0";
                            var left = "0";
                            if (window.innerWidth > documentWidth) { // we can center
                                marginLeft = "-" + (documentWidth / 2) + "px";
                                left = "50%";
                            }
                            slides.slice(0, slides.length - 1).forEach(function (
                                slide) {
                                slide.style.marginLeft = marginLeft;
                                slide.style.left = left;
                            });
                            Util.scrollTo(0, 0);
                        }
                    });

                    // when scrolling while table of contents / keyslides are open, update highlighting:
                    var updateHighlights = function (event) {
                        Menubar.highlightCurrentTableOfContent();
                        Menubar.highlightCurrentKeySlide(Util.indexOfCurrentSlide());
                    };
                    document.addEventListener("scroll", updateHighlights, false);

                    return {
                        className: "ldjs-slide",
                        name: "Presentation",
                        render: function () {
                            slides.forEach(function (slide) {
                                Util.bodyContent().appendChild(slide);
                            });
                            var slide = State.get("currentSlide");
                            if (slide == -1 || slide >= slides.length) {
                                log("Renderer: invalid slide index " + slide,
                                    debug_ERROR);
                                slide = 0;
                                State.update({
                                    currentSlide: 0
                                });
                            }
                            zoom(State.get("presentationZoomFactor"));
                            showSlide(slide);
                            if (!State.get("doNotShowMenuHint")) {
                                var message =
                                    "<p><b>To open the menu bar, click on the page number in the lower right corner.</b></p>" +
                                    '<p><input type="checkbox" id="ldjs-menu-hint-do-not-show-again">' +
                                    '<label for="ldjs-menu-hint-do-not-show-again">Do not show again</label></input></p>';
                                // we need a timeout here to make sure that the
                                // message box does not alter state while we are
                                // in an update cycle.
                                // you do not want to adapt the message box for
                                // return value collection. you really don't.
                                setTimeout(function () {
                                    MessageBox.show("ldjs-menu-hint", "", "Info",
                                        message, {
                                            getLabel: "Ok",
                                            execute: function () {
                                                var selection = document.getElementById(
                                                    "ldjs-menu-hint-do-not-show-again"
                                                ).checked;
                                                State.update({
                                                    doNotShowMenuHint: selection
                                                });
                                            }
                                        }, null, true);
                                }, 1);
                            }
                        }
                    };
                }();
                /**
                 * @memberof Renderer.modes
                 * @namespace notes
                 */
                Renderer.modes.notes = function () {
                    var body = State.get("theDocumentBody").cloneNode(true).querySelector(
                        'body>div#body-content');
                    // 1. remove any whitespace or comment between the body tag 
                    //    and the first non-text element
                    while (body.hasChildNodes()) {
                        var isComment = body.firstChild.noteType === Node.COMMENT_NODE;
                        var isWhitespaceText = body.firstChild.nodeType === Node.TEXT_NODE && !
                            /\S/.test(body.firstChild
                                .data)
                        if (isComment || isWhitespaceText) {
                            body.removeChild(body.firstChild);
                            log("whitespace removed from the beginning of the document");
                        } else {
                            break;
                        }
                    }

                    // 2. create the lecture notes representation
                    var lectureNotes = document.createElement("div");
                    lectureNotes.id = "ldjs-lecture-notes";

                    var subSection = document.createElement("div");
                    subSection.className = "ldjs-lecture-notes-subsection";
                    lectureNotes.appendChild(subSection);

                    var sidebar;

                    var content = document.createElement("div");
                    content.className = "ldjs-lecture-notes-content";
                    subSection.appendChild(content);

                    while (body.hasChildNodes()) {
                        var currentNode = body.firstChild;
                        body.removeChild(currentNode);

                        if (currentNode.tagName === 'SECTION') {
                            if (!/slide/.test(currentNode.className)) { // currentNode.className !== "slide"){
                                var nextNode = body.firstChild;
                                while (currentNode.hasChildNodes()) {
                                    var node = currentNode.firstChild;
                                    currentNode.removeChild(node);
                                    body.insertBefore(node, nextNode);
                                }

                                continue;
                            }

                            // we create a new section
                            subSection = document.createElement("div");
                            subSection.className = "ldjs-lecture-notes-subsection";
                            lectureNotes.appendChild(subSection);

                            sidebar = document.createElement("div");
                            sidebar.className = "ldjs-lecture-notes-sidebar";
                            subSection.appendChild(sidebar);
                            sidebar.appendChild(currentNode);

                            var sectionBody = currentNode.querySelector(
                                "section.slide>div.section-body")
                            if (sectionBody) {
                                var asides = sectionBody.querySelectorAll(
                                    "div.section-body>aside");
                                for (var i = 0; i < asides.length; i++) {
                                    var aside = asides[i];
                                    sectionBody.removeChild(aside);
                                    sidebar.appendChild(aside);
                                }
                            }

                            content = document.createElement("div");
                            content.className = "ldjs-lecture-notes-content";
                            subSection.appendChild(content);
                        } else {
                            content.appendChild(currentNode);
                        }
                    }

                    var footer = document.createElement("div");
                    footer.id = "ldjs-lecture-notes-footer";
                    footer.appendChild(document.createTextNode("Generated " + new Date()));

                    return {
                        className: "ldjs-lecture-notes",
                        name: "Compact",
                        render: function () {
                            Util.bodyContent().appendChild(lectureNotes);
                            Util.bodyContent().appendChild(footer);
                        }
                    };
                }();
                /**
                 * @memberof Renderer.modes
                 * @namespace lighttable
                 */
                Renderer.modes.lighttable = function () {
                    var slides = State.get("theSlides").map(function (slide, i) {
                        var lightTableSlide = document.createElement("div");
                        lightTableSlide._index = i;
                        lightTableSlide.className = "ldjs-light-table-slide";
                        lightTableSlide.appendChild(slide.cloneNode(true));
                        var slideNumberSpan = document.createElement("span");
                        slideNumberSpan.className = "ldjs-light-table-slide-number";
                        slideNumberSpan.innerHTML = i + 1;
                        lightTableSlide.appendChild(slideNumberSpan);
                        return lightTableSlide;
                    });
                    Events.onClick(".ldjs-light-table-slide", function (event) {
                        if (isFinite(this._index)) {
                            Util.jumpToSlide(this._index)();
                        }
                    });

                    /**
                     * Zooms all slides to the zoom factor set in
                     * ApplicationState.
                     * @memberof Renderer.modes.lighttable
                     * @inner
                     */

                    function zoom() {
                        var factor = State.get("lightTableZoomFactor");
                        log("Renderer: zoom to factor " + factor + " (light table)");
                        var transform = 'scale(%zoom,%zoom)'.replace(/%zoom/g, factor);
                        var width = (State.get("slideWidth") * factor) + 'px';
                        var height = (State.get("slideHeight") * factor) + 'px';
                        slides.forEach(function (slide) {
                            slide.style.width = width;
                            var section = slide.querySelector('section.slide');
                            section.style.width = width;
                            section.style.height = height;
                            var slideBody = section.querySelector('div.section-body');
                            slideBody.style.transform = transform;
                            slideBody.style.WebkitTransform = transform;
                        });
                    };

                    return {
                        className: "ldjs-light-table",
                        name: "Light Table",
                        render: function () {
                            slides.forEach(function (slide) {
                                Util.bodyContent().appendChild(slide);
                            });
                            zoom(State.get("lightTableZoomFactor"));
                            State.addListener(function (state) {
                                zoom(state.get("lightTableZoomFactor"));
                            }, "lightTableZoomFactor");
                        }
                    };
                }();
                /**
                 * @memberof Renderer.modes
                 * @namespace continuous
                 */
                Renderer.modes.continuous = function () {
                    return {
                        className: "ldjs-continuous-layout",
                        name: "Continuous",
                        render: function () {
                            State.get("theSlides").forEach(function (slide) {
                                Util.bodyContent().appendChild(slide);
                            });
                        }
                    };
                }();
            }
        };
    }();
    /**
     * Manages the Touch Events in the presentation mode like laserpointer or swipe motions.
     * @namespace PresentationTouchHandler
     */
    var PresentationTouchHandler = function () {

        /**
         * The x-coordinate from the starting point of the touch.
         * @memberof PresentationTouchHandler
         */
        var startX = 0;
        /**
         * The y-coordinate from the starting point of the touch.
         * @memberof PresentationTouchHandler
         */
        var startY = 0;
        /**
         * The difference between the current x-coordinate on the page and the starting x-coordinate
         * @memberof PresentationTouchHandler
         */
        var deltaX = 0;
        /**
         * The difference between the current y-coordinate on the page and the starting y-coordinate
         * @memberof PresentationTouchHandler
         */
        var deltaY = 0;
        /**
         * The Action which gets executed when a right swipe occured.
         * @memberof PresentationTouchHandler
         */
        var rightAction;
        /**
         * The Action which gets executed when a left swipe occured.
         * @memberof PresentationTouchHandler
         */
        var leftAction;
        /**
         * The Action which gets executed when a point was touched.
         * @memberof PresentationTouchHandler
         */
        var touchAction;
        /**
         * The minimum length of a swipe to get recognized.
         * The average width of a human index finger is 57px.
         * You have to move your finger double the width to active a swipe motion.
         * @memberof PresentationTouchHandler
         */
        var minLength = 114;
        /**
         * Holds information about the Swipemotion, if it is going vertical or not.
         * @memberof PresentationTouchHandler
         */
        var isScrolling;
        /**
         * Tracks if you touch the screen on a single point for more than a second.
         * @memberof PresentationTouchHandler
         */
        var laserPointerTracker;
        /**
         * The timestamp for the last touchstart events occurence
         * @memberof PresentationTouchHandler
         */
        var timestamp;
        /**
         * Signals if the laserpointer needs to be shown or not.
         * @memberof PresentationTouchHandler
         */
        var isLaserPointerActive = false;

        /**
         * Capulse the touch events for the presentation mode.
         * @memberof PresentationTouchHandler
         * @namespaces events
         */
        var events = {
            /**
             * Checks if the touchfunction is enabled for the content and only one finger is being used.
             * If thats the case it forwards the event to the corresponding function.
             * @memberof PresentationTouchHandler.events
             * @inner
             */
            handleEvent: function (event) {
                if (!Util.isNavigationableInPresentationMode() || event.touches.length >
                    1) {
                    return;
                }
                switch (event.type) {
                case 'touchstart':
                    this.start(event);
                    break;
                case 'touchmove':
                    this.move(event);
                    break;
                case 'touchend':
                    this.end(event);
                    break;
                }
            },
            /**
             * Gets the x and y coordinate of the starting touch
             * and start the tracker for the laserpointer
             * @memberof PresentationTouchHandler.events
             * @inner
             */
            start: function (event) {
                //looks if a finger is hold on the same spot for one second.
                var tracker = function () {
                    var deltaTime = Date.now() - timestamp;
                    if (deltaTime >= 1000 && deltaX == 0 && deltaY == 0) {
                        isLaserPointerActive = true;
                        clearInterval(laserPointerTracker);
                    } else {
                        isLaserPointerActive = false;
                    }
                }
                timestamp = Date.now();
                startX = event.touches[0].pageX;
                startY = event.touches[0].pageY;
                laserPointerTracker = setInterval(tracker, 500);
                isScrolling = undefined;
                deltaX = 0;
                deltaY = 0;
            },
            /**
             * Keeps track of the difference between the current x and y coordinate
             * and the x and y coordinate of the starting touch when the finger moves.
             * @memberof PresentationTouchHandler.events
             * @inner
             */
            move: function (event) {
                if (laserPointerTracker !== undefined) {
                    clearInterval(laserPointerTracker);
                }

                deltaX = event.touches[0].pageX - startX;
                deltaY = event.touches[0].pageY - startY;
                //checks if it is a vertical motion
                if (typeof isScrolling == 'undefined') {
                    isScrolling = !! (isScrolling || Math.abs(deltaX) < Math.abs(deltaY));
                }
                if (!isScrolling) {
                    event.preventDefault();
                }

            },
            /**
             * Determines if the finger motion was a single touch or swipe and in which direction it went.
             * @memberof PresentationTouchHandler.events
             * @inner
             */
            end: function (event) {
                clearInterval(laserPointerTracker);
                if (isLaserPointerActive) {
                    isLaserPointerActive = false;
                    return;
                }
                //if the move event didnt occur(single touch) and the laserpointer wasnt triggered
                if (typeof isScrolling == 'undefined' && !isLaserPointerActive) {
                    //is here for later functionality. Adding content sequentialy.
                    return;
                }
                if (!isScrolling && Math.abs(deltaX) >= minLength) {
                    if (deltaX > 0) { //right direction
                        rightAction.execute();
                    } else {
                        leftAction.execute();
                    }
                }
            }
        }
        /**
         * @namespace PresentationTouchHandler
         */
        return {
            /**
             * Sets the Actions for the left swipe, right swipe and the single touch.
             * Also registers the eventlisteners for the touchevents.
             * @memberof PresentationTouchHandler
             * @inner
             */
            initialize: function () {
                if ( !! ('ontouchstart' in window)) {
                    leftAction = Actions.NextSlideAction;
                    rightAction = Actions.PreviousSlideAction;
                    touchAction = function () {
                        return true;
                    };
                    Util.bodyContent().addEventListener('touchstart', events, false);
                    Util.bodyContent().addEventListener('touchmove', events, false);
                    Util.bodyContent().addEventListener('touchend', events, false);

                }
            },
            /**
             * Returns if the laserpointer is active or not.
             * @memberof PresentationTouchHandler
             * @inner
             */
            isLaserPointerActive: function () {
                return isLaserPointerActive;
            }
        };
    }();

    /**
     * Encapsulates key stroke and mouse click events.
     * @namespace Events
     */
    var Events = function () {
        function blockEvent(event) {
            event.preventDefault();
            event.stopPropagation();
        }

        /**
         * @namespace Events
         */
        return {
            /**
             * Binds the Action's key strokes to the Action's execute function.
             * @param {Action} action the action to bind
             * @param {String} [type=keyup] the kind of key event to react to
             * @memberof Events
             * @inner
             */
            bindKeys: function (action, type) {
                if (!action.getKeyStrokes) {
                    return;
                }
                type = type || "keyup";
                log("Events: binding " + action.getKeyStrokes.toString() + " to " +
                    action.getId + " for " + type);
                Mousetrap.bind(action.getKeyStrokes, action.execute, type);
                action.addListener(function (source, modifiedProperties) {
                    if (source !== action) return;
                    Mousetrap.unbind(modifiedProperties["getKeyStrokes"].oldValue);
                    Mousetrap.bind(modifiedProperties["getKeyStrokes"].newValue,
                        action.execute);
                }, ["getKeyStrokes"]);
            },
            /**
             * Adds the given callback as an onClick listener to the given element.
             * @param {String} selector css to select the element that should react to clicks
             * @param {Function} f the callback function (will be passed the event object)
             * @memberof Events
             * @inner
             */
            onClick: function (selector, f) {
                Gator(document).on("click", selector, f);
            },
            /**
             * Registers the onClick listener on the document body that is then used to
             * receive and dispatch click events.
             * @memberof Events
             * @inner
             */
            initialize: function () {
                Gator(document).on("keyup", MessageBox.keyListener);
                Gator(document);
                Gator(document).on("keyup", "body", function (event) {
                    var changes = {};
                    if (State.get("mode") !== "presentation" ||
                        State.get("isModalDialogActive")) return;
                    var entered = State.get("enteredSlideNumber");
                    if (event.keyCode >= 48 && event.keyCode <= 57) {
                        var digit = event.keyCode - 48;
                        entered = entered === null ? digit : entered * 10 + digit;
                    } else if (event.keyCode == 13 && entered !== null) {
                        entered = Math.min(entered, State.get("theSlides").length + 1);
                        changes["currentSlide"] = entered > 0 ? entered - 1 : entered;
                        entered = null;
                    } else if (event.keyCode == 8 && entered !== null) {
                        entered = entered < 10 ? null : Math.floor(entered / 10);
                        // block default backspace action (history back in some browsers)
                        event.preventDefault();
                    } else {
                        entered = null;
                    }
                    log("Events: jump to slide " + entered);
                    changes["enteredSlideNumber"] = entered;
                    State.update(changes);
                });
                State.addListener(function (state, modifiedProperties) {
                    var entered = modifiedProperties.enteredSlideNumber.newValue;
                    var info = document.querySelector("#ldjs-jump-target-info");
                    if (entered === null && info !== null) {
                        info.classList.add("fadeout");
                        setTimeout(function () {
                            info.parentElement.removeChild(info);
                        }, 600);
                    } else if (entered !== null) {
                        if (info === null) {
                            info = document.createElement("div");
                            info.id = "ldjs-jump-target-info";
                            document.body.appendChild(info);
                        }
                        info.innerHTML = entered;
                    }
                }, "enteredSlideNumber");
            },
            blockKeyEvents: function () {
                log("Events: blocking keyboard events");
                Mousetrap.pause();
                document.addEventListener("keydown", blockEvent, false);
            },
            permitKeyEvents: function () {
                log("Events: allowing keyboard events");
                document.removeEventListener("keydown", blockEvent, false);
                Mousetrap.unpause();
            }
        };
    }();

    /**
     * Functions to show/hide message boxes.
     * @namespace MessageBox
     */
    var MessageBox = {
        /**
         * If MessageBox.show is called while a modal dialog is active, the
         * parameters of that call are appended to this queue. When a dialog is
         * hidden and there is at least one dialog queued, the first waiting
         * dialog is shown.
         * @memberof MessageBox
         * @inner
         */
        queue: [],
        /**
         * Displays a message box with one or two buttons (default: "Ok",
         * optionally: "Cancel").
         * If there is already another dialog, this call is being deferred until
         * the other dialog has been closed.
         * @param {String} id this will be the id attribute of the generated
         * HTML element
         * @param {String} [className=ldjs-message-box ldjs-message-box-information]
         * this will be the initial className attribute of the generated HTML
         * element. It will always contain ldjs-message-box.
         * @param {String} title the dialog's title (may contain HTML)
         * @param {String} message this is the message that will be displayed
         * (may contain HTML)
         * @param {Action} [onOk] if given, this Action will be used for the
         * "Ok" button. It will provide the button's label and its execute
         * function will be called with the click event as sole parameter before
         * the message box is hidden.
         * @param {Action} [onCancel] if given, the generated message box will
         * have a "Cancel" button in addition to the "Ok" button whose label and
         * behavior will be determined by this action. This action's execute
         * function will be called with the click event as the sole parameter
         * before the dialog is hidden.
         * @param {Boolean} [modal=false] if true, the message box will be made
         * modal, i.e. no user interaction with the remaining application will
         * be permitted until the message box has been closed using either the
         * "Ok" or (if present) the "Cancel" button.
         * @memberof MessageBox
         * @inner
         */
        show: function (id, className, title, message, onOk, onCancel, modal) {
            if (document.querySelector(".ldjs-message-box")) {
                MessageBox.queue.push(Util.toArray(arguments));
                return;
            }
            var messageBox = document.createElement("div");
            messageBox.id = id;
            messageBox.className = "ldjs-message-box " + (className ||
                "ldjs-message-box-information");
            var header = document.createElement("header");
            header.innerHTML = title;
            messageBox.appendChild(header);
            var container = document.createElement("div");
            container.className = "ldjs-message-box-content";
            container.innerHTML = message;
            messageBox.appendChild(container);
            var buttons = document.createElement("div");
            buttons.className = "ldjs-message-box-buttons";
            messageBox.appendChild(buttons);
            var okButton = document.createElement("div");
            okButton.className = "ldjs-message-box-button ldjs-message-box-ok";
            okButton.innerHTML = onOk ? onOk.getLabel || "Ok" : "Ok";
            okButton.addEventListener("click", function (event) {
                if (onOk && typeof onOk.execute === "function") {
                    onOk.execute(event);
                }
                MessageBox.hide(id);
            }, false);
            buttons.appendChild(okButton);
            if (onCancel && onCancel.getLabel && typeof onCancel.execute === "function") {
                var cancelButton = document.createElement("div");
                cancelButton.className =
                    "ldjs-message-box-button ldjs-message-box-cancel";
                cancelButton.addEventListener("click", function (event) {
                    onCancel.execute(event);
                    MessageBox.hide(id);
                }, false);
                cancelButton.innerHTML = onCancel.getLabel || "Cancel";
                buttons.appendChild(cancelButton);
            }
            if (modal) {
                if (State.get("isModalDialogActive")) return;
                State.update({
                    overlayLayerColor: "white",
                    isOverlayActive: true,
                    isModalDialogActive: true
                });
                messageBox.classList.add("ldjs-modal-dialog");
            }
            Gator(window).on("resize", MessageBox.resizeWindow);
            document.body.appendChild(messageBox);
            MessageBox.resizeWindow();
        },
        /**
         * Hides the visible message box with the given id. Does nothing if
         * there is no message box with this id.
         * @param {String} id the id of the message box that should be hidden
         * @memberof MessageBox
         * @inner
         */
        hide: function (id) {
            var messageBox = document.getElementById(id);
            if (messageBox) {
                log("MessageBox: hiding" + id);
                if (messageBox.classList.contains("ldjs-modal-dialog")) {
                    State.update({
                        isOverlayActive: false,
                        isModalDialogActive: false
                    });
                }
                messageBox.parentNode.removeChild(messageBox);
                if (MessageBox.queue.length > 0) {
                    var args = MessageBox.queue.shift();
                    MessageBox.show.apply(MessageBox, args);
                }
            }
        },
        keyListener: function (event) {
            var messageBoxes = document.querySelectorAll(".ldjs-message-box");
            if (messageBoxes.length == 0) {
                return;
            }
            var topmost = messageBoxes[messageBoxes.length - 1];
            switch (event.keyCode) {
            case 13:
                topmost.querySelector(".ldjs-message-box-ok").click();
                break;
            case 27:
                var cancel = topmost.querySelector(".ldjs-message-box-cancel");
                if (cancel) cancel.click();
                else topmost.querySelector(".ldjs-message-box-ok").click();
                break;
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        },
        resizeWindow: function (event) {
            Util.toArray(document.querySelectorAll(".ldjs-message-box")).forEach(function (
                messageBox) {
                // since css does not support max-height percent values with overflowing,
                // we need to calculate those percentages ourselves
                var height = window.innerHeight;
                // height*0.1 = top padding
                // 51/height*0.1 = lower padding (to keep the dialog above the menu bar)
                height -= height * 0.1 + (Math.max(51, height * 0.1));
                messageBox.style.maxHeight = height + "px";
                // subtract 80 from the inner container height for the button container
                // and the header
                var container = messageBox.querySelector(".ldjs-message-box-content");
                container.style.maxHeight = (height - 80) + "px";
            });
        }
    }

    /**
     * Various functions that have no other place
     * @namespace Util
     */
    var Util = {
        /**
         * Convenience function to return the content element into which the
         * modes will place their rendered content.
         * @memberof Util
         * @inner
         */
        bodyContent: function () {
            return document.getElementById("body-content");
        },
        /**
         * Convenience function that returns true if and only if the current
         * mode is the presentation mode.
         * @return {Boolean} as described.
         * @memberof Util
         * @inner
         */
        isInPresentationMode: function () {
            return State.get("mode") === "presentation";
        },
        /**
         * Convenience function that returns true if and only if the current
         * mode is the light table mode.
         * @return {Boolean} as described.
         * @memberof Util
         * @inner
         */
        isInLightTableMode: function () {
            return State.get("mode") === "lighttable";
        },
        /**
         * Convenience function that returns true if and only if the current
         * mode is the notes mode.
         * @return {Boolean} as described.
         * @memberof Util
         * @inner
         */
        isInNotesMode: function () {
            return State.get("mode") === "notes";
        },
        /**
         * A function that returns true if and only if the current mode
         * is the presentation mode and the canvas is not shown.
         * @return {Boolean} as described.
         * @memberof Util
         * @inner
         */
        isNavigationableInPresentationMode: function () {
            var enableSelected = State.get("mode") === "presentation" && !State.get(
                "isTouchDrawingEnabled");
            var canvas = Util.bodyContent().querySelector(
                ".slide.current .ldjs-canvas");
            if (!canvas) {
                return enableSelected;
            }
            var visible = canvas.classList.contains("visible");
            return !visible || enableSelected;
        },
        /**
         * Returns a function that, when executed, switches to presentation mode and
         * displays the slide with the given index.
         * @param {Number} slideIndex the index (first slide = 0) of the slide to jump to
         * @memberof Util
         * @inner
         */
        jumpToSlide: function (slideIndex) {
            return function () {
                var changes = {};
                changes["currentSlide"] = slideIndex;
                log("Util: jump to slide " + slideIndex);
                if (Util.isInPresentationMode() || Util.isInLightTableMode()) {
                    changes["mode"] = "presentation";
                } else {
                    var slide = document.querySelectorAll("section.slide")[slideIndex];
                    slide.scrollIntoView(true);
                }
                State.update(changes);
            }
        },
        /**
         * Returns a function that, when executed, scrolls the viewport so that the headline
         * is visible at the very top. In presentation mode switches to the slide that
         * succeeds the headline
         * @param {Number} headlineIndex the index (first headline = 0) of the headline to jump to
         * @memberof Util
         * @inner
         */
        jumpToHeadline: function (headlineIndex) {
            return function () {
                log("Util: jump to headline " + headlineIndex);
                if (Util.isInPresentationMode()) {
                    var slideIndex = -1;
                    var headlineCounter = -1;
                    var headlines = Util.bodyContent().querySelectorAll(
                        "#body-content>h1,#body-content>h2,#body-content>h3," +
                        "#body-content>h4,#body-content>h5,#body-content>h6," +
                        "#body-content > section.slide");
                    for (var i = 0; i < headlines.length; i++) {
                        if (!headlines[i].classList.contains("slide")) {
                            headlineCounter++;
                            if (headlineCounter === headlineIndex) {
                                Util.jumpToSlide(slideIndex + 1);
                                return;
                            }
                        } else {
                            slideIndex++;
                        }
                    }
                } else if (Util.isInNotesMode()) {
                    var headline = Util.bodyContent().querySelectorAll(
                        "#ldjs-lecture-notes")[0]
                        .querySelectorAll(
                            "#ldjs-lecture-notes div.ldjs-lecture-notes-subsection div.ldjs-lecture-notes-content>h1," +
                            "#ldjs-lecture-notes div.ldjs-lecture-notes-subsection div.ldjs-lecture-notes-content>h2," +
                            "#ldjs-lecture-notes div.ldjs-lecture-notes-subsection div.ldjs-lecture-notes-content>h3," +
                            "#ldjs-lecture-notes div.ldjs-lecture-notes-subsection div.ldjs-lecture-notes-content>h4," +
                            "#ldjs-lecture-notes div.ldjs-lecture-notes-subsection div.ldjs-lecture-notes-content>h5," +
                            "#ldjs-lecture-notes div.ldjs-lecture-notes-subsection div.ldjs-lecture-notes-content>h6"
                    )[headlineIndex];
                    headline.scrollIntoView(true);
                } else {
                    var headline = Util.bodyContent().querySelectorAll(
                        "#body-content>h1,#body-content>h2,#body-content>h3," +
                        "#body-content>h4,#body-content>h5,#body-content>h6")[
                        headlineIndex];
                    headline.scrollIntoView(true);
                }
                Menubar.highlightCurrentTableOfContent();
            }
        },
        /**
         * Adds an element with the slide's number to it.
         * @param {HTMLElement} slide the slide to add the number to
         * @param {Number} index the index of the slide (slide number = index + 1)
         * @memberof Util
         * @inner
         */
        addSlideNumber: function (slide, index) {
            var slideNumber = document.createElement("div");
            slideNumber.innerHTML = index + 1;
            slideNumber.className = "ldjs-slide-number";
            slide.querySelector(".section-body").appendChild(slideNumber);
        },
        /**
         * Calculates the zoom factor necessary to display the current slide as
         * big as possible without cutting off anything and updates the State.
         * @memberof Util
         * @inner
         */
        fitPresentationSlideToPage: function () {
            log("Util: fit presentation slide to page");
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;
            var factor = 1;
            var windowResolution = windowWidth / windowHeight;
            if (windowResolution >= State.get("slideAspectRatio")) {
                factor = windowHeight / State.get("slideHeight");
            } else {
                factor = windowWidth / State.get("slideWidth");
            }
            State.update({
                presentationZoomFactor: factor
            });
        },
        /**
         * Returns the page's scroll position. This is necessary because Firefox
         * scrolls the html node while Chrome scrolls the body node.
         * @return {Offset} the page's scroll position
         * @memberof Util
         * @inner
         */
        getScrollPosition: function () {
            return {
                left: document.body.scrollLeft || document.body.parentElement.scrollLeft,
                top: document.body.scrollTop || document.body.parentElement.scrollTop
            };
        },
        /**
         * Sets the page's scroll position.
         * @param {Number} top how many pixels to scroll to from the top
         * @param {Number} left how many pixels to scroll to from the left
         * @see Util.getScrollPosition regarding browser quirks
         * @memberof Util
         * @inner
         */
        setScrollPosition: function (top, left) {
            if (document.body.scrollLeft) {
                document.body.scrollLeft = left;
            } else if (document.body.parentElement.scrollLeft) {
                document.body.parentElement.scrollLeft = left;
            }
            if (document.body.scrollTop) {
                document.body.scrollTop = top;
            } else if (document.body.parentElement.scrollTop) {
                document.body.parentElement.scrollTop = top;
            }
        },
        /**
         * @typedef Offset
         * @type {Object}
         * @property {Number} top
         * @property {Number} left
         */
        /**
         * Computes the absolute pixel coordinates on the page of the given
         * element.<br> "Absolute" here refers to the css position attribute
         * "absolute", as in absolute with respect to the current page.
         * @param {HTMLElement} element the element
         * @return {Offset} the element's offset
         * @memberof Util
         * @inner
         */
        getOffset: function (element) {
            var left = 0;
            var top = 0;
            while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
                left += element.offsetLeft;
                top += element.offsetTop;
                element = element.offsetParent;
            }
            return {
                top: top,
                left: left
            };
        },
        /**
         * @typedef Box
         * @type {Object}
         * @property top
         * @property left
         * @property width
         * @property height
         */
        /**
         * Computes the given element's bounding box, consisting of its top left
         * corner as returned by getOffset as well as its width and height.
         * @param {HTMLElement} element the element for which to compute the
         * bounding box.
         * @return {Box}
         * @memberof Util
         * @inner
         */
        getBox: function (element) {
            var offset = Util.getOffset(element);
            return {
                top: offset.top,
                left: offset.left,
                height: element.offsetHeight,
                width: element.offsetWidth
            };
        },
        /**
         * Determines if a DOM element is (partially) visible in the current
         * viewport.
         * @param {HTMLElement} element the element to check
         * @return {Boolean} true if the element is (partially) visible in the
         * current viewport, false if it resides entirely outside of the current
         * viewport.
         * @see getBox
         * @see isBoxInViewport
         * @memberof Util
         * @inner
         */
        isElementInViewport: function (element) {
            return Util.isBoxInViewport(getBox(element));
        },
        /**
         * Determines if the given bounding box is (partially) visible in the
         * current viewport.
         * @param {Box} box the box to check
         * @return {Boolean} true if the element is (partially) visible in the
         * current viewport, false if it resides entirely outside of the current
         * viewport.
         * @see Util.getBox
         * @memberof Util
         * @inner
         */
        isBoxInViewport: function (box) {
            return (box.top < (window.pageYOffset + window.innerHeight) &&
                box.left < (window.pageXOffset + window.innerWidth) &&
                (box.top + box.height) > window.pageYOffset &&
                (box.left + box.width) > window.pageXOffset);
        },
        /**
         * Determines if the given child element is a child of the given parent
         * element. Designed to work on HTML elements, but can work with any
         * structure whose elements provide a <code>parentNode</code> field.<br>
         * @param {HTMLElement} parent the parent node
         * @param {HTMLElement} child the child node
         * @return {Boolean} true if child is below parent or parent == child
         * @memberof Util
         * @inner
         */
        isDescendant: function (parent, child) {
            var node = child;
            while (node != null) {
                if (node == parent) {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        },
        /**
         * Finds the index of the first (out of slide-)headline that is (partially) displayed in
         * the current viewport.
         * @return {Number} in Presentation Mode, this method simply returns
         * State.get("currentSlide").
         * In any other mode, it returns the index of the first headline from the
         * top left corner that is at least partially in the current viewport.
         * If, e.g. because of notes or slides between headlines, there are no headlines in the
         * current viewport, this method returns the index of the headline that
         * precedes the current viewport.
         * @memberof Util
         * @inner
         */
        indexOfCurrentHeadline: function () {
            if (Util.isInPresentationMode()) {
                return State.get("currentSlide");
            } else {
                var headlines = undefined;
                if (Util.isInNotesMode()) {
                    headlines = Util.bodyContent().querySelectorAll("#ldjs-lecture-notes")[
                        0]
                        .querySelectorAll(
                            "#ldjs-lecture-notes div.ldjs-lecture-notes-subsection div.ldjs-lecture-notes-content > h1," +
                            "#ldjs-lecture-notes div.ldjs-lecture-notes-subsection div.ldjs-lecture-notes-content > h2," +
                            "#ldjs-lecture-notes div.ldjs-lecture-notes-subsection div.ldjs-lecture-notes-content > h3," +
                            "#ldjs-lecture-notes div.ldjs-lecture-notes-subsection div.ldjs-lecture-notes-content > h4," +
                            "#ldjs-lecture-notes div.ldjs-lecture-notes-subsection div.ldjs-lecture-notes-content > h5," +
                            "#ldjs-lecture-notes div.ldjs-lecture-notes-subsection div.ldjs-lecture-notes-content > h6"
                    );
                } else {
                    headlines = Util.bodyContent().querySelectorAll(
                        "#body-content>h1,#body-content>h2,#body-content>h3," +
                        "#body-content>h4,#body-content>h5,#body-content>h6");
                }
                for (var i = headlines.length - 1; i >= 0; i--) {
                    var box = Util.getBox(headlines[i]);
                    if (Util.isHeadlineAboveTreshold(box)) {
                        return i;
                    }
                }
                log("indexOfCurrentHeadline: Could not be determined, returning -1",
                    debug_WARNING);
                return -1;
            }
        },
        /**
         * Returns true if the headline has bypassed a certain treshold and the viewport is
         * considered to be after the headline.
         * @param {Box} box the box to check
         * @return {boolean}
         * @see Util.getBox
         * @memberof Util
         * @inner
         */
        isHeadlineAboveTreshold: function (box) {
            var delta = window.innerHeight * (1 / 4);
            return (box.top < window.pageYOffset + delta);
        },
        /**
         * Finds the index of the first slide that is (partially) displayed in
         * the current viewport.
         * @return {Number} in Presentation Mode, this method simply returns
         * State.get("currentSlide").
         * In any other mode, it returns the index of the first slide from the
         * top left corner that is at least partially in the current viewport.
         * If, e.g. because of notes between slides, there are no slides in the
         * current viewport, this method returns the index of the slide that
         * precedes the current viewport.
         * @memberof Util
         * @inner
         */
        indexOfCurrentSlide: function () {
            if (State.get("mode") === "presentation") {
                return State.get("currentSlide");
            } else {
                var theSlides = Util.bodyContent().querySelectorAll("section.slide");
                for (var i = 0; i < theSlides.length; i++) {
                    var box = Util.getBox(theSlides[i]);
                    if (Util.isBoxInViewport(box)) {
                        return i;
                    } else if (box.top >= (window.pageYOffset + window.innerHeight)) {
                        return i - 1;
                    }
                }
                return -1;
            }
        },
        /**
         * Creates a new element with the given tag name and appends the passed
         * element as the new element's only child.
         * @param {HTMLElement} element the element to wrap
         * @param {String} wrapperTag the tag name of the element that will be
         * created
         * @memberof Util
         * @inner
         */
        wrapIn: function (element, wrapperTag) {
            var wrapperElement = document.createElement(wrapperTag);
            wrapperElement.appendChild(element);
            return wrapperElement;
        },
        /**
         * Shorthand to wrap the passed element in an "li" element.
         * @see Util.wrapIn
         * @memberof Util
         * @inner
         */
        wrapInLi: function (element) {
            return Util.wrapIn(element, "li");
        },
        /**
         * Shifts an element's scroll position by a certain amount of pixels.
         * @param {HTMLElement} element the element to scroll
         * @param {Number} amount the amount to scroll by (positive scrolls
         * toward right edge, negative toward left)
         * @memberof Util
         * @inner
         */
        scrollBy: function (element, amount) {
            element.scrollLeft += amount;
        },
        /**
         * Sets an element's scroll position to a certain position.
         * @param {HTMLElement} element the element whose scroll position will
         * be changed
         * @param {Number} where position to jump to
         * @memberof Util
         * @inner
         */
        scrollTo: function (element, where) {
            element.scrollLeft = where;
        },
        /**
         * Compares the size of the current slide and the window and, if the
         * slide is bigger than the window, activates scrollbars.
         * @memberof Util
         * @inner
         */
        manageScrollbars: function () {
            if (State.get("mode") !== "presentation") return;
            var slide = Util.bodyContent().querySelector("section.slide");
            if (slide === null) return;
            var isWider = slide.clientWidth > window.innerWidth + 1;
            var isHigher = slide.clientHeight > window.innerHeight + 1;
            if (isWider || isHigher) {
                document.body.classList.add("scroll");
            } else {
                document.body.classList.remove("scroll");
            }
        },
        /**
         * Adds a pair consisting of a dt and a dd element to the given dl.
         * @param {HTMLElement} definitionList the dl to add to
         * @param {String} term the definition term
         * @param {String} definition the definition text
         * @memberof Util
         * @inner
         */
        addDefinition: function (definitionList, term, definition) {
            var definitionTerm = document.createElement("dt");
            definitionTerm.innerHTML = term;
            definitionList.appendChild(definitionTerm);
            var definitionDescription = document.createElement("dd");
            definitionDescription.innerHTML = definition;
            definitionList.appendChild(definitionDescription);
        },
        /**
         * Constructs the LectureDoc help from the given helpData object and stores
         * it in the helpNode field.
         * @see LectureDoc.setHelp for the required fields of the helpData object
         * @memberof Util
         * @inner
         */
        buildHelpNode: function (helpData) {
            var helpNode = document.createElement("div");
            helpNode.id = "ldjs-help";

            var help = helpData.content;
            if (typeof help === "string") {
                var p = document.createElement("p");
                p.appendChild(document.createTextNode(help));
                helpNode.appendChild(p);
            } else {
                var definitionList = document.createElement("dl");
                for (var group in help) {
                    for (var key in help[group]) {
                        var definition = help[group][key].join(", ");
                        Util.addDefinition(definitionList, key, definition);
                    }
                    Util.addDefinition(definitionList, "", "&nbsp;");
                }
                helpNode.appendChild(definitionList);
            }
            var lastModifiedSpan = document.createElement("span");
            lastModifiedSpan.style.fontWeight = "bold";
            var helpFooter = document.createElement("footer");
            var p = document.createElement("p");
            p.id = "ldjs-help-last-modified-info";
            var lastModifiedDate = State.get("lastModified");
            if (lastModifiedDate instanceof Date) {
                p.appendChild(document.createTextNode(
                    "This document was last modified on "));
                p.appendChild(lastModifiedSpan);
                lastModifiedSpan.appendChild(document.createTextNode(lastModifiedDate.toLocaleString()));
            } else {
                p.appendChild(document.createTextNode("Modification date not available."));
            }
            helpFooter.appendChild(p);
            var footer = helpData.footer ||
                "LectureDoc © 2013, 2014 Michael Eichberg, Marco Jacobasch, Arne Lottmann, " +
                "Daniel Killer, Simone Wälde, Kerstin Reifschläger, " +
                "David Becker, Tobias Becker, Andre Pacak, Volkan Hacimüftüoglu";
            p = document.createElement('p');
            p.innerHTML = footer;
            helpFooter.appendChild(p);
            helpNode.appendChild(helpFooter);
            return helpNode;
        },
        /**
         * Converts an array-like structure (e.g. a NodeList) to an Array.
         * @param {Object} nodeList the structure to convert
         * @return {Array}
         * @memberof Util
         * @inner
         */
        toArray: function (nodeList) {
            return Array.prototype.slice.call(nodeList);
        },
        /**
         * Merges the *own* properties of two objects into a new object. If a
         * property is defined in both objects, the definition in the second
         * parameter overrides the one in the first.
         * @param {Object} anObject
         * @param {Object} anotherObject
         * @memberof Util
         * @inner
         */
        merge: function (anObject, anotherObject) {
            if (!anObject) return anotherObject;
            if (!anotherObject) return anObject;
            var merged = {};
            Object.keys(anObject).forEach(function (k) {
                merged[k] = anObject[k];
            });
            Object.keys(anotherObject).forEach(function (k) {
                if (k in merged) {
                    if (merged[k] === anotherObject[k]) {
                        log("Merge: overwriting (unchanged value):" +
                            debugString(k, merged[k], anotherObject[k]),
                            debug_TRACE);
                    } else {
                        log("Merge: overwriting (value changed): " +
                            debugString(k, merged[k], anotherObject[k]),
                            debug_WARNING);
                    }
                }
                merged[k] = anotherObject[k];
            });
            return merged;
        }
    };

    /**
     * Functions that create the menu bar.
     * @namespace Menubar
     */
    var Menubar = {
        /**
         * The HTML element representing the menu bar.
         * @type {HTMLElement}
         * @memberof Menubar
         * @inner
         */
        element: undefined,
        iconsFolder: "Library/LectureDoc/MenuIcons/",
        /**
         * Determines the visibility of an HTML element based on the presence of
         * the class "visible".
         * @param {{String|HTMLElement}} [what] If left out, checks the menu
         * bar's visibility.
         * If String, checks for the element with that id.
         * @memberof Menubar
         * @inner
         */
        isVisible: function (what) {
            if (what === undefined) return State.get("isMenubarVisible");
            if (typeof what === "string") what = document.getElementById(what);
            if (what === null || typeof what !== "object" || !what.className) return false;
            return what.className.search(/\bvisible\b/) !== -1;
        },
        createModesSubmenu: function () {
            var builder = new Menubar.SubmenuBuilder("modes", "ul", "Modes");
            [
                Actions.PresentationModeAction,
                Actions.DocumentModeAction,
                Actions.NotesModeAction,
                Actions.LightTableModeAction,
                Actions.ContinuousModeAction
            ].forEach(function (action) {
                builder.addButton(Menubar.createTextButton(action));
            });
            return builder.element;
        },
        createTableOfContentsSubmenu: function () {
            var builder = new Menubar.SubmenuBuilder("table-of-contents", "ol",
                "Table of Contents");
            // get all headers that are not within a slide:
            var j = 0;
            // variable to determine the lowest depth found in the document
            // initializing with highest possible depth (h6)
            var lowestDepth = 6;
            var tableOfContentsList = State.get("theTableOfContents")
                .map(function (element, i) {
                    if (!element.classList.contains("slide")) {
                        var action = new ActionBuilder().setLabel(element.textContent)
                            .setExecute(Util.jumpToHeadline(j)).buildAction();
                        var button = Menubar.createTextButton(action);
                        var depth = parseInt(element.nodeName.charAt(1));
                        j++;
                        lowestDepth = (depth < lowestDepth) ? depth : lowestDepth;
                        return [button, depth];
                    } else {
                        return [-1, 0];
                    }
                }).filter(function (element) {
                    return element[0] !== -1;
                });
            builder.addNestedButtons(tableOfContentsList, lowestDepth);

            State.addListener(function (state, modifiedProperties) {
                Menubar.highlightCurrentTableOfContent();
            }, "currentSlide");
            return builder.element;
        },
        /**
         * Highlights the table of content entry that corresponds to the slide closest to the one
         * currently displayed.
         */
        highlightCurrentTableOfContent: function () {
            if (!Menubar.element) return;
            var highlightedNow = Menubar.element.querySelector(
                "#ldjs-menubar-submenu-table-of-contents .current");
            var i = Util.indexOfCurrentHeadline();
            log("Table of Contents: highlighting " + i);
            if (i == -1) return;
            var buttons = Util.toArray(Menubar.element.querySelectorAll(
                "#ldjs-menubar-submenu-table-of-contents a"));
            var highlightedNext = buttons[i];
            if (highlightedNext) {
                if (highlightedNext === highlightedNow)
                    return;
                if (highlightedNow)
                    highlightedNow.classList.remove("current");
                highlightedNext.classList.add("current");
            }
        },
        createKeySlidesSubmenu: function () {
            var builder = new Menubar.SubmenuBuilder("key-slides", "ol", "Key Slides");
            State.get("theSlides").map(function (slide, i) {
                return [slide, i];
            }).filter(function (slideWithIndex) {
                return !!slideWithIndex[0].dataset.title;
            }).forEach(function (slideWithIndex) {
                var slide = slideWithIndex[0];
                var i = slideWithIndex[1];
                var action = new ActionBuilder().setLabel(slide.dataset.title).
                setExecute(Util.jumpToSlide(i)).buildAction();
                var button = Menubar.createTextButton(action);
                button._index = i;
                builder.addButton(button);
            });
            State.addListener(function (state, modifiedProperties) {
                Menubar.highlightCurrentKeySlide(modifiedProperties.currentSlide.newValue);
            }, "currentSlide");
            return builder.element;
        },
        /**
         * Highlights the key slide entry that corresponds to the slide closest to the one
         * currently displayed.
         * @param {Number} currentSlideIndex the index of the currently displayed slide
         */
        highlightCurrentKeySlide: function (currentSlideIndex) {
            if (!Menubar.element) return;
            var highlightedNow = Menubar.element.querySelector(
                "#ldjs-menubar-submenu-key-slides .current");
            if (highlightedNow) highlightedNow.classList.remove("current");
            var theSlides = State.get("theSlides");
            if (currentSlideIndex < 0 || currentSlideIndex >= theSlides.length) return;
            var i = currentSlideIndex + 1;
            do {
                i--;
            } while (i >= 0 && !theSlides[i].dataset.title);
            if (i == -1) return;
            var buttons = Util.toArray(Menubar.element.querySelectorAll(
                "#ldjs-menubar-submenu-key-slides a"));
            var theButton = buttons.filter(function (button) {
                return button._index == i;
            })[0];
            if (theButton) theButton.classList.add("current");
        },
        createPresentationZoomSubmenu: function () {
            var builder = new Menubar.SubmenuBuilder("presentation-zoom", "ul", "Zoom");

            function zoom(factor) {
                return function () {
                    State.update({
                        presentationZoomFactor: factor
                    });
                };
            }
            var action = new ActionBuilder();
            [3, 2.5, 2, 1.5, 1, 0.75, 0.5].forEach(function (factor) {
                builder.addButton(Menubar.createTextButton(action.setExecute(zoom(
                        factor))
                    .setLabel(factor * 100 + "%").setActive(function () {
                        return State.get("presentationZoomFactor") === factor;
                    }).buildAction()));
            });
            builder.addButton(Menubar.createTextButton(action.setExecute(Util.fitPresentationSlideToPage)
                .setLabel("Fit to page").setActive(false).buildAction()));
            return builder.element;
        },
        createLightTableZoomSubmenu: function () {
            var builder = new Menubar.SubmenuBuilder("light-table-zoom", "ul", "Zoom");

            function zoom(factor) {
                return function () {
                    State.update({
                        lightTableZoomFactor: factor
                    });
                };
            }
            var action = new ActionBuilder();
            [100, 75, 50, 25, 10, 5, 2].forEach(function (factor) {
                builder.addButton(Menubar.createTextButton(action.setExecute(zoom(
                        factor / 100))
                    .setLabel(factor + "%").setActive(function () {
                        return State.get("lightTableZoomFactor") === factor /
                            100;
                    }).buildAction()));
            });
            return builder.element;
        },
        /**
         * @memberof Menubar
         * @inner
         * @namespace Menubar.createScrollingOverview
         */
        createScrollingOverview: function () {
            var overview = document.createElement("div");
            overview.id = "ldjs-menubar-submenu-scrolling-overview";
            overview.className = "ldjs-menubar-submenu";

            var theSlides = State.get("theSlides");
            theSlides.forEach(function (slide, i) {
                var clone = slide.cloneNode(true);
                clone._index = i;
                overview.appendChild(clone);
            });
            Events.onClick("#ldjs-menubar-submenu-scrolling-overview", function (event) {
                var x = overview.scrollLeft + event.clientX;
                var slide = Util.toArray(overview.childNodes).filter(function (
                    element) {
                    var left = element.offsetLeft;
                    var right = left + element.offsetWidth;
                    return left <= x && right >= x;
                })[0];
                if (isFinite(slide._index)) {
                    Util.jumpToSlide(slide._index)();
                }
            });
            var highlight = document.createElement("div");
            highlight.innerHTML = " ";
            highlight.id = "current-slide-highlight";
            overview.appendChild(highlight);

            var scrollIntervalHandler = undefined;
            var scrollInterval = 50; // milliseconds
            // speeds in pixels
            var minimumSpeed = 2;
            var maximumSpeed = 50;

            var leftRegion = 1 / 3;
            var rightRegion = 1 - leftRegion;

            /*
             * Scrolling speed is calculated with the inner edge of the scrolling
             * area mapped to minimumSpeed and the outer edge mapped to
             * maximumSpeed. The variables base and stretch are used in the
             * conversion; they are obtained as:
             * 1 - leftRegion * stretch + base = minimumSpeed
             * 1 * stretch + base = maximumSpeed
             */
            var base = (minimumSpeed - rightRegion * maximumSpeed) / leftRegion;
            var stretch = maximumSpeed - base;

            /**
             * Converts the given position ratio to a scroll amount.
             * @param {Number} ratio is expected to be between 0 (left edge) and
             * 1 (right edge)
             * @return the amount of pixels to scroll, regardless of direction
             * @memberof Menubar.createScrollingOverview
             * @inner
             */

            function ratioToAmount(ratio) {
                if (ratio < 0.5) ratio = 1 - ratio; // normalize to (1-leftRegion) .. 1
                return ratio * stretch + base;
            }

            /**
             * Internal state that stores the amount of pixels to scroll per step.
             * @memberof Menubar.createScrollingOverview
             * @inner
             */
            var scrollAmount = 0;

            /**
             * Terminates the scrolling interval registered under the
             * scrollIntervalHandler variable.
             * @memberof Menubar.createScrollingOverview
             * @inner
             */

            function stopScrolling() {
                if (scrollIntervalHandler !== undefined) {
                    clearInterval(scrollIntervalHandler);
                    scrollIntervalHandler = undefined;
                    scrollAmount = 0;
                }
            }

            /**
             * Repeatedly scrolls the given element by the specified amount; the
             * repetition interval is given in the variable scrollInterval.
             * Halts previous scrolling prior to registering its own scrolling
             * interval.
             * @param element the element (DOM element)
             * @param amount the amount to scroll ( < 0 to the left, > 0 to the
             * right )
             * @memberof Menubar.createScrollingOverview
             * @inner
             */

            function scrollRepeat(element, amount) {
                scrollAmount = amount;
                if (scrollIntervalHandler === undefined) {
                    scrollIntervalHandler = setInterval(function () {
                        Util.scrollBy(element, scrollAmount);
                    }, scrollInterval);
                }
            }

            /**
             * Internal state that stores the information if the Scrolling Overview is touched on the touchscreen.
             * @memberof Menubar.createScrollingOverview
             * @inner
             */
            var isPressed;

            /**
             * Represents the x-coordinate of the start of a touchgesture.
             * @memberof Menubar.createScrollingOverview
             * @inner
             */
            var startX;

            /**
             * Stores if the touchgesture is only a tap with the finger or a swipemotion.
             * @memberof Menubar.createScrollingOverview
             * @inner
             */
            var isScrolling;

            /**
             * The velocity of the finger moving over the scrolling overview.
             * @memberof Menubar.createScrollingOverview
             * @inner
             */
            var velocity;

            /**
             * The amplitude of the swipe.
             * @memberof Menubar.createScrollingOverview
             */
            var amplitude;

            /**
             * Last time the trackVelocity or the startTouch function was called.
             * @memberof Menubar.createScrollingOverview
             */
            var timestamp;

            /**
             * Handler for calculating the velocity.
             * @member of Menubar.createScrollingOverview
             */
            var velocityIntervalHandler;

            /**
             * Keeps track how many pixel it moved to calculate the velocity.
             * @member of Menubar.createScrollingOverview
             */
            var offset;
            /**
             * Is the evaluated function which we are trying to find with the differantial equation.
             * Determines how many pixel we have to move if it is still autoscrolling.
             * @member of Menubar.createScrollingOverview
             */
            var targetLeft;

            // The whole process of scrolling is modeled with the differential equation y' = y-a*e^(-t/tau)
            // You can look it up at overdamped springmass system.
            // tau is chosen as 325 to get a feeling like on iOS.
            // y is targetLeft
            // a is our amplitude which is calculated in respect to the velocity
            // t is deltaTime
            function startTouch(event) {
                if (event.touches.length != 1) {
                    return;
                }
                //set all variables up for tracking the velocity
                velocity = amplitude = 0;
                offset = overview.scrollLeft;
                timestamp = Date.now();
                clearInterval(velocityIntervalHandler);
                //check every 100ms
                velocityIntervalHandler = setInterval(trackVelocity, 100);

                isPressed = true;
                isScrolling = false;
                startX = event.touches[0].pageX;
                event.preventDefault();
                event.stopPropagation();
            }

            function moveTouch(event) {
                if (isPressed && event.touches.length == 1) {
                    isScrolling = true;
                    var delta = startX - event.touches[0].pageX;
                    //average finger 57px wide, 57/10 = 5.7 rounded up 
                    if (delta > 6 || delta < -6) {
                        startX = event.touches[0].pageX;
                        Util.scrollBy(overview, delta);
                    }
                }
            }

            function trackVelocity() {
                var now, deltaTime, deltaX, v;
                now = Date.now();
                deltaTime = now - timestamp;
                timestamp = now;
                deltaX = overview.scrollLeft - offset;
                offset = overview.scrollLeft;
                v = 1000 * deltaX / (1 + deltaTime);
                velocity = 0.8 * v + 0.2 * velocity;
            }

            function changeOrientation(event) {
                startX = undefined;
                isPressed = false;
                isScrolling = false;
                clearInterval(velocityIntervalHandler);
                amplitude = velocity = offset = 0;
                timestamp = 0;
                targetLeft = 0;
            }

            function decreaseScrollSpeed() {
                var deltaTime, deltaX;
                if (amplitude) {
                    deltaTime = Date.now() - timestamp;
                    deltaX = -amplitude * Math.exp(-deltaTime / 325);
                    if (deltaX > 0.5 || deltaX < -0.5) { // more than a half pixel
                        Util.scrollTo(overview, targetLeft + deltaX);
                        requestAnimationFrame(decreaseScrollSpeed);
                    } else {
                        Util.scrollTo(overview, targetLeft);
                    }
                }
            }

            function endTouch(event) {
                isPressed = false;
                clearInterval(velocityIntervalHandler);
                //prevent scrolling if velocity is too low.
                if (velocity > 10 || velocity < -10) {
                    amplitude = 0.8 * velocity;
                    targetLeft = Math.round(overview.scrollLeft + amplitude);
                    timestamp = Date.now();
                    requestAnimationFrame(decreaseScrollSpeed);
                }
                //if it was only a tap
                if (!isScrolling) {
                    var x = overview.scrollLeft + startX;
                    var slide = Util.toArray(overview.childNodes).filter(function (
                        element) {
                        var left = element.offsetLeft;
                        var right = left + element.offsetWidth;
                        return left <= x && right >= x;
                    })[0];
                    if (isFinite(slide._index)) {
                        Util.jumpToSlide(slide._index)();
                    }
                }
                event.preventDefault();
                event.stopPropagation();
            }

            //checks if the device has a touchscreen.
            if ( !! ('ontouchstart' in window)) {
                overview.addEventListener('touchstart', startTouch);
                overview.addEventListener('touchmove', moveTouch);
                overview.addEventListener('touchend', endTouch);
                overview.addEventListener('orientationchange', changeOrientation);
            }

            function startScrolling(event) {
                log("Menubar: scrolling overview starts scrolling");
                var width = overview.clientWidth;
                var x = event.clientX;
                var ratio = x / width;
                var amount = ratioToAmount(ratio);
                if (ratio <= leftRegion) {
                    scrollRepeat(overview, -amount);
                } else if (ratio >= rightRegion) {
                    scrollRepeat(overview, amount);
                } else {
                    stopScrolling();
                }
            }
            overview.addEventListener("mousemove", startScrolling, false);
            overview.addEventListener("mouseout", stopScrolling, false);
            State.addListener(function (state, modifiedProperties) {
                var currentSlideIndex = modifiedProperties.currentSlide.newValue;
                Menubar.scrollOverviewToSlide(currentSlideIndex);
                var currentSlide = overview.querySelectorAll("section.slide")[
                    currentSlideIndex];
                var highlight = overview.querySelector("#current-slide-highlight");
                if (currentSlide) {
                    highlight.style.left = currentSlide.style.left;
                    highlight.style.display = "block";
                } else {
                    highlight.style.display = "none";
                }
            }, "currentSlide");

            return overview;
        },
        /**
         * Scrolls the overview so that the given slide is as close to the center
         * of the overview as possible.
         * @param {Number} slide the slide to put in the center
         * @memberof Menubar
         */
        scrollOverviewToSlide: function (slide) {
            var overview = document.getElementById(
                "ldjs-menubar-submenu-scrolling-overview");
            var overviewSlideWidth = overview.querySelector("section.slide").offsetWidth;
            var leftForCenter = -(overview.offsetWidth - overviewSlideWidth) / 2;
            var slideLeft = overviewSlideWidth * slide;
            var targetLeft = slideLeft + leftForCenter;
            Util.scrollTo(overview, targetLeft);
        },
        createCanvasSubmenu: function () {
            var builder = new Menubar.SubmenuBuilder("canvas", "ul", "Canvas");
            if ( !! ('ontouchstart' in window)) {
                builder.addButton(Menubar.createTextButton(new ActionBuilder(
                    "canvas-enable-mobile").setLabel(
                    function () {
                        if (!State.get("isTouchDrawingEnabled")) {
                            return "enable";
                        } else {
                            return "disable";
                        }
                    }).setEnabled(function () {
                    var canvas = Util.bodyContent().querySelector(
                        ".slide.current .ldjs-canvas");
                    if (!canvas) return;
                    var visible = canvas.classList.contains("visible");
                    var empty = canvas.querySelector("svg").childNodes.length ==
                        0;
                    return visible && !empty;
                }).setExecute(function () {
                    if (State.get("isTouchDrawingEnabled")) {
                        State.update({
                            isTouchDrawingEnabled: false
                        });
                    } else {
                        State.update({
                            isTouchDrawingEnabled: true
                        });
                    }
                }).buildAction()));
            }
            builder.addButton(Menubar.createTextButton(new ActionBuilder("canvas-hide").setLabel(
                function () {
                    var canvas = Util.bodyContent().querySelector(
                        ".slide.current .ldjs-canvas");
                    if (!canvas) return;
                    var visible = canvas.classList.contains("visible");
                    if (visible) {
                        return "hide";
                    } else {
                        return "show";
                    }
                }).setEnabled(function () {
                var canvas = Util.bodyContent().querySelector(
                    ".slide.current .ldjs-canvas");
                if (!canvas) return;
                var visible = canvas.classList.contains("visible");
                var empty = canvas.querySelector("svg").childNodes.length ==
                    0;
                return visible || !empty;
            }).setExecute(function () {
                var currentIndex = Util.indexOfCurrentSlide();
                var slides = Util.bodyContent().querySelectorAll(
                    "section.slide");
                var slide = slides[currentIndex];
                if (!slide) return;
                var canvas = slide.querySelector(".ldjs-canvas");
                var visible = canvas.classList.contains("visible");
                if (visible) {
                    State.update({
                        isTouchDrawingEnabled: false
                    });
                    canvas.classList.remove("visible");
                } else {
                    canvas.classList.add("visible");
                }
            }).buildAction()));
            builder.addButton(Menubar.createTextButton(new ActionBuilder("canvas-clear").setLabel(
                "clear").setEnabled(function () {
                return !!Util.bodyContent().querySelector(
                    ".slide.current .ldjs-canvas.visible");
            }).setExecute(function () {
                var svg = Util.bodyContent().querySelector(
                    ".slide.current .ldjs-canvas.visible svg");
                while (svg.hasChildNodes()) {
                    svg.removeChild(svg.firstChild);
                }
            }).buildAction()));
            ["black", "red", "yellow"].forEach(function (color) {
                builder.addButton(Menubar.createTextButton(new ActionBuilder(
                    "canvas-set-stroke-" + color).setLabel(
                    "<span style=\"color: " + color +
                    "; pointer-events: none;\">" + color + "</span>").setExecute(
                    function () {
                        var currentIndex = Util.indexOfCurrentSlide();
                        var slides = Util.bodyContent().querySelectorAll(
                            "section.slide");
                        var slide = slides[currentIndex];
                        if (!slide) return;
                        var canvas = slide.querySelector(".ldjs-canvas");
                        canvas.classList.add("visible");
                        canvas.dataset.strokeColor = color;
                        if ( !! ('ontouchstart' in window)) {
                            State.update({
                                isTouchDrawingEnabled: true
                            });
                        }
                        this.update();
                    }).setActive(function () {
                    var currentIndex = Util.indexOfCurrentSlide();
                    var slides = Util.bodyContent().querySelectorAll(
                        "section.slide");
                    var slide = slides[currentIndex];
                    if (!slide) return;
                    var canvas = slide.querySelector(
                        ".ldjs-canvas.visible");
                    return canvas && canvas.dataset.strokeColor === color;
                }).buildAction()));
            });
            return builder.element;
        },
        /**
         * Initializes the menu bar. After this method call, Menubar.element will
         * be an HTML nav element with id "ldjs-menubar".
         * @memberof Menubar
         */
        initialize: function () {
            Menubar.element = document.createElement("nav");
            Menubar.element.id = "ldjs-menubar";
            Menubar.element.className = "visible";
            var submenus = {
                asides: new Menubar.SubmenuBuilder("asides", "ul", "Asides").element,
                modes: Menubar.createModesSubmenu(),
                presentationZoom: Menubar.createPresentationZoomSubmenu(),
                lightTableZoom: Menubar.createLightTableZoomSubmenu(),
                scrollingOverview: Menubar.createScrollingOverview(),
                keySlides: Menubar.createKeySlidesSubmenu(),
                tableOfContents: Menubar.createTableOfContentsSubmenu(),
                canvas: Menubar.createCanvasSubmenu(),
            };
            Actions.ToggleMenubarAction = new ActionBuilder("toggle-menubar").
            setEnabled(Util.isInPresentationMode).setIcon("").setExecute(function () {
                if (Menubar.element !== undefined) {
                    if (Menubar.isVisible()) {
                        State.update({
                            isMenubarVisible: false
                        });
                    } else {
                        State.update({
                            isMenubarVisible: true
                        });
                    }
                }
            }).setLabel(function () {
                if (Util.isInPresentationMode()) {
                    var slideNumber = String(State.get("currentSlide") + 1);
                    var isLastSlide = State.get("currentSlide") == State.get(
                        "theSlides").length;
                    var className = "ldjs-slide-number";
                    var isBlackout = State.get("isOverlayActive") && State.get(
                        "overlayLayerColor") === "black";
                    var isWhiteout = State.get("isOverlayActive") && State.get(
                        "overlayLayerColor") === "white";
                    if ((isBlackout || (isLastSlide && !isWhiteout)) && !Menubar.isVisible()) {
                        className += " dimmed";
                    }
                    return "<div class=\"" + className + "\"><p>" + slideNumber +
                        "</p></div>";
                }
                return "";
            }).buildAction();

            function getAsidesForCurrentSlide() {
                return State.get("slideAsides")[State.get("currentSlide")];
            }

            function isNotOnPresentationFinishedSlide() {
                return !Util.isInPresentationMode() || (State.get("currentSlide") < State
                    .get("theSlides").length);
            }

            /** @memberof Actions */
            Actions.ToggleAsidesAction = new ActionBuilder("toggle-submenu-asides").setIcon(
                "nav").
            setEnabled(function () {
                var asides = getAsidesForCurrentSlide();
                return Util.isInPresentationMode() && asides && asides.length > 0;
            }).setVisible(function () {
                if (!Util.isInPresentationMode()) return false;
                if (State.get("isOverlayActive") && !Menubar.isVisible()) return false;
                var asides = getAsidesForCurrentSlide();
                return Menubar.isVisible() || asides && asides.length > 0;
            }).setExecute(function (event) {
                if (!Menubar.isVisible(submenus.asides)) {
                    var buttons = submenus.asides.querySelector(
                        ".ldjs-menubar-submenu-buttons");
                    buttons.innerHTML = ""; // remove all children
                    getAsidesForCurrentSlide().forEach(function (link) {
                        buttons.appendChild(Util.wrapInLi(link));
                    });
                }
                Menubar.toggleSubmenu("asides")(event);
            }).setKeyStrokes(["a"]).buildAction();
            /** @memberof Actions */
            Actions.ToggleModesAction = new ActionBuilder("toggle-submenu-modes").setIcon(
                "modes").
            setKeyStrokes(["m"]).setExecute(Menubar.toggleSubmenu("modes")).setEnabled(
                function () {
                    return State.get("theSlides").length > 0;
                }).buildAction();
            /** @memberof Actions */
            Actions.TogglePresentationZoomAction = new ActionBuilder(
                "toggle-submenu-presentation-zoom").
            setIcon("zoom").setEnabled(isNotOnPresentationFinishedSlide).
            setVisible(Util.isInPresentationMode).
            setExecute(Menubar.toggleSubmenu("presentation-zoom")).buildAction();
            /** @memberof Actions */
            Actions.ToggleLightTableZoomAction = new ActionBuilder(
                "toggle-submenu-light-table-zoom").
            setIcon("zoom").setEnabled(Util.isInLightTableMode).setVisible(Util.isInLightTableMode)
                .setExecute(Menubar.toggleSubmenu("light-table-zoom")).buildAction();

            /**
             * @return true if key-slides and overview buttons should be visible.
             * @memberof Actions
             */

            function showSlideNavigationButtons() {
                var mode = State.get("mode");
                return !(mode === "lighttable" || mode === "continuous");
            }

            /** @memberof Actions */
            Actions.ToggleScrollingOverviewAction = new ActionBuilder(
                "toggle-submenu-scrolling-overview").
            setIcon("overview").setEnabled(function () {
                return showSlideNavigationButtons() && State.get("theSlides").length >
                    0;
            }).
            setVisible(showSlideNavigationButtons).setKeyStrokes(["o"]).
            setExecute(function (event) {
                var overview = submenus.scrollingOverview;
                var button = Menubar.element.querySelector(
                    "#ldjs-menubar-button-toggle-submenu-scrolling-overview");
                if (!Menubar.isVisible(overview)) {
                    var left = 0;
                    Util.toArray(overview.querySelectorAll("section.slide")).forEach(
                        function (slide) {
                            slide.style.left = left + "px";
                            left += slide.offsetWidth;
                        });
                    var currentSlideIndex = Util.indexOfCurrentSlide();
                    var currentSlide = overview.querySelectorAll("section.slide")[
                        currentSlideIndex];
                    var highlight = overview.querySelector("#current-slide-highlight");
                    if (currentSlide) {
                        highlight.style.left = currentSlide.style.left;
                        highlight.style.display = "block";
                    } else {
                        highlight.style.display = "none";
                    }
                    Menubar.scrollOverviewToSlide(currentSlideIndex);
                    Menubar.hideAllSubmenus();
                    State.update({
                        isMenubarVisible: true
                    });
                    button.classList.add("active");
                    Menubar.show("ldjs-menubar-submenu-scrolling-overview");
                } else {
                    button.classList.remove("active");
                    Menubar.hide("ldjs-menubar-submenu-scrolling-overview");
                    if (event.type.search("^key") === 0 && Util.isInPresentationMode()) {
                        State.update({
                            isMenubarVisible: false
                        });
                    }
                }
            }).buildAction();
            /** @memberof Actions */
            Actions.ToggleKeySlidesAction = new ActionBuilder(
                "toggle-submenu-key-slides").
            setIcon("key-slides").setEnabled(function () {
                return showSlideNavigationButtons() &&
                    State.get("theSlides").filter(function (slide) {
                        return !!slide.dataset.title;
                    }).length > 0;
            }).
            setVisible(showSlideNavigationButtons).setKeyStrokes(["k"]).
            setExecute(function (event) {
                var currentSlideIndex = Util.indexOfCurrentSlide();
                Menubar.highlightCurrentKeySlide(currentSlideIndex);
                Menubar.toggleSubmenu("key-slides")(event);
            }).buildAction();

            Actions.ToggleTableOfContentsAction = new ActionBuilder(
                "toggle-submenu-table-of-contents").
            setIcon("table-of-contents").setEnabled(function () {
                return showSlideNavigationButtons() &&
                    (State.get("mode") !== "presentation") &&
                    State.get("theTableOfContents").filter(function (element) {
                        return !element.classList.contains("slide");
                    }).length > 0;
            }).
            setVisible(function () {
                return showSlideNavigationButtons() && (State.get("mode") !==
                    "presentation")
            }).
            setKeyStrokes(["t"]).
            setExecute(function (event) {
                Menubar.highlightCurrentTableOfContent();
                Menubar.toggleSubmenu("table-of-contents")(event);
            }).buildAction();

            /**
             * Action to toggle the current slide's canvas.
             * @memberof Actions
             */
            Actions.CanvasAction = new ActionBuilder("toggle-submenu-canvas").setIcon(
                "canvas").
            setVisible(Util.isInPresentationMode).setKeyStrokes(["c"]).setEnabled(
                function () {
                    return Util.isInPresentationMode() &&
                        isNotOnPresentationFinishedSlide();
                }).setExecute(function (event) {
                if (Menubar.isVisible("ldjs-menubar-submenu-modes") &&
                    event.type.search("^key") === 0) {
                    return;
                }
                Menubar.toggleSubmenu("canvas")(event);
            }).setActive(function () {
                var currentIndex = Util.indexOfCurrentSlide();
                var slides = Util.bodyContent().querySelectorAll("section.slide");
                var slide = slides[currentIndex];
                return !!(slide && slide.querySelector(".ldjs-canvas.visible"));
            }).buildAction();

            var buttons = [
                Menubar.createIconButton(Actions.HelpAction, "left"),
                Menubar.createIconButton(Actions.PrintAction, "left"),
                Menubar.createSeparator("left"),
                Menubar.createTextButton(Actions.ToggleMenubarAction, "right"),
                Menubar.createIconButton(Actions.ToggleAsidesAction),
                Menubar.createSeparator("right"),
                Menubar.createIconButton(Actions.ToggleModesAction),
                Menubar.createIconButton(Actions.TogglePresentationZoomAction),
                Menubar.createIconButton(Actions.ToggleLightTableZoomAction),
                Menubar.createIconButton(Actions.ToggleScrollingOverviewAction),
                Menubar.createIconButton(Actions.ToggleKeySlidesAction),
                Menubar.createIconButton(Actions.ToggleTableOfContentsAction),
                Menubar.createIconButton(Actions.CanvasAction),
                Menubar.createIconButton(Actions.BlackoutAction),
                Menubar.createIconButton(Actions.WhiteoutAction)
            ];
            buttons.concat(Object.keys(submenus).map(function (s) {
                return submenus[s];
            })).forEach(function (element) {
                Menubar.element.appendChild(element);
            });

            State.addListener(function (state, modifiedProperties) {
                if (modifiedProperties.isMenubarVisible.newValue) {
                    Menubar.show();
                } else {
                    Menubar.hideAllSubmenus();
                    Menubar.hide();
                }
            }, "isMenubarVisible");
            State.addListener(function (state, modifiedProperties) {
                if (state.get("mode") !== "presentation") return;
                var submenusToClose = ["asides", "presentation-zoom", "modes",
                    "canvas"];
                submenusToClose.forEach(function (id) {
                    var menu = Menubar.element.querySelector(
                        "#ldjs-menubar-submenu-" + id);
                    var button = Menubar.element.querySelector(
                        "#ldjs-menubar-button-toggle-submenu-" + id);
                    Menubar.hideSubmenu(menu, button);
                });
            }, "currentSlide");
            Events.onClick(".ldjs-menubar-button", function (event) {
                var button = event.target;
                if (button.action) {
                    button.action.execute(event);
                }
            });
            Events.onClick("#" + Menubar.element.id, function (event) {
                if (event.target.parentNode !== Menubar.element ||
                    event.target.id === "ldjs-menubar-submenu-scrolling-overview") {
                    Menubar.hideAllSubmenus();
                }
                if (event.target === Menubar.element) return;
                if (!Util.isInPresentationMode() || !Menubar.isVisible()) return;
                if (event.target.id === "ldjs-menubar-button-toggle-menubar") return;
                if (event.target.id.search(/-toggle-submenu-/) === -1) {
                    State.update({
                        isMenubarVisible: false
                    });
                }
            });
            Gator(window).on("resize", function () {
                var submenu = Menubar.element.querySelector(
                    ".ldjs-menubar-submenu.visible");
                if (!submenu) return;
                var buttonId = submenu.id.replace(/^(ldjs-menubar-)(submenu-.*)/,
                    "$1button-toggle-$2");
                var button = document.getElementById(buttonId);
                if (button) {
                    Menubar.centerHorizontallyOverElement(submenu, button);
                } else {
                    submenu.style.left = Math.max(0, parseInt(submenu.style.left)) +
                        "px";
                }
            });
            if (State.get("mode") === "presentation") {
                State.update({
                    isMenubarVisible: false
                });
            }
        },
        /**
         * Hides the given element by removing its "visible" class.
         * @param {{String|HTMLElement}} what If left undefined, hides the menu bar.
         * If String, hides the element with that id. Otherwise hides the element.
         * @memberof Menubar
         */
        hide: function (what) {
            if (what === undefined) {
                Menubar.element.classList.remove("visible");
            }
            if (typeof what === "string") what = document.getElementById(what);
            if (what === null || typeof what !== "object" || !what.classList) return;
            what.classList.remove("visible");
        },
        /**
         * Shows the given element by adding its "visible" class.
         * @param {{String|HTMLElement}} what If left undefined, shows the menu bar.
         * If String, shows the element with that id. Otherwise shows the element.
         * @memberof Menubar
         */
        show: function (what) {
            if (what === undefined) {
                Menubar.element.classList.add("visible");
            }
            if (typeof what === "string") what = document.getElementById(what);
            if (what === null || typeof what !== "object" || !what.classList) return;
            what.classList.add("visible");
        },
        /**
         * Creates a self-updating button from the given action with label
         * and/or icon. The button floats to the side specified with the float
         * parameter.
         * @param {Action} action the Action that controls this button
         * @param {String} [float=right] must be "left", "right", or undefined
         * @param {Boolean} [useIcon=false]
         * @param {Boolean} [useLabel=false]
         * @return {HTMLElement} an HTML a element representing the given Action
         * @memberof Menubar
         */
        createButton: function (action, float, useIcon, useLabel) {
            var button = document.createElement("a");
            button.className = "ldjs-menubar-button " + (float || "right");
            button.id = "ldjs-menubar-button-" + action.getId;
            if (!action.isEnabled) {
                button.classList.add("disabled");
            }
            if (!action.isVisible) {
                Menubar.hide(button);
            } else {
                Menubar.show(button);
            }
            if (action.isActive) {
                button.classList.add("active");
            }
            button.action = action;
            var properties = ["isVisible", "isEnabled", "getId", "isActive"];
            if (useLabel) {
                properties = properties.concat("getLabel");
                button.innerHTML = action.getLabel;
            }
            if (useIcon && action.getIcon) {
                properties = properties.concat("getIcon");
                button.classList.add("ldjs-menubar-icon-button");
                button.style.backgroundImage = 'url("' + Menubar.iconsFolder + action.getIcon +
                    '.svg")';
            }
            action.addListener(function (action, modifiedProperties) {
                if (modifiedProperties.isVisible) {
                    if (modifiedProperties.isVisible.newValue) {
                        Menubar.show(button);
                    } else {
                        Menubar.hide(button);
                    }
                }
                if (modifiedProperties.isEnabled) {
                    if (modifiedProperties.isEnabled.newValue) {
                        button.classList.remove("disabled");
                    } else {
                        button.classList.add("disabled");
                    }
                }
                if (modifiedProperties.isActive) {
                    if (modifiedProperties.isActive.newValue) {
                        button.classList.add("active");
                    } else {
                        button.classList.remove("active");
                    }
                }
                if (modifiedProperties.getId) {
                    button.id = modifiedProperties.getId.newValue;
                }
                if (useLabel && modifiedProperties.getLabel) {
                    button.innerHTML = modifiedProperties.getLabel.newValue;
                }
                if (useIcon && modifiedProperties.getIcon) {
                    if (modifiedProperties.getIcon.newValue) {
                        var path = Menubar.iconsFolder + modifiedProperties.getIcon.newValue;
                        button.style.backgroundImage = 'url("' + path + '.svg")';
                    } else {
                        button.style.backgroundImage = "";
                    }
                }
            }, properties);
            return button;
        },
        /**
         * Creates a self-updating button with an icon from the given action.
         * @see Menubar.createButton
         * @memberof Menubar
         */
        createIconButton: function (action, float) {
            return Menubar.createButton(action, float, true, false);
        },
        /**
         * Creates a self-updating button with a label from the given action.
         * @see Menubar.createButton
         * @memberof Menubar
         */
        createTextButton: function (action, float) {
            return Menubar.createButton(action, float, false, true);
        },
        /**
         * Creates a visual separator element that floats to the side specified
         * by the float parameter.
         * @param {String} float must be "left", "right", or undefined
         * @return {HTMLElement} a span with classes "separator" and float
         * @memberof Menubar
         */
        createSeparator: function (float) {
            var separator = document.createElement("span");
            separator.className = "separator " + (float || "right");
            return separator;
        },
        /**
         * Hides all children of the menubar with the class name "ldjs-menubar-submenu".
         * @see Menubar.hide
         * @memberof Menubar
         */
        hideAllSubmenus: function () {
            if (!Menubar.element) return;
            Util.toArray(Menubar.element.querySelectorAll(".ldjs-menubar-submenu")).forEach(
                function (submenu) {
                    // remove "ldjs-menubar-submenu" => length 20
                    var idPart = submenu.id.substring(20);
                    var button = Menubar.element.querySelector(
                        "#ldjs-menubar-button-toggle-submenu" + idPart);
                    Menubar.hideSubmenu(submenu, button);
                });
        },
        /**
         * Builder to create a list-based submenu. Elements are added via calls to
         * <pre>builder.addButton()</pre>
         * and the resulting submenu can be retrieved via
         * <pre>builder.element</pre>.
         * <br>
         * The element is an HTML ol element with class "ldjs-menubar-submenu" and id
         * "ldjs-menubar-submenu-" + the provided id parameter.
         * @param {String} id the submenus id fragment
         * @param {String} [type=ol] the type of list to create for this submenu (ul or ol)
         * @param {String} [header=""] the text to put at the top of the dialog (may contain html)
         * @class SubmenuBuilder
         * @memberof Menubar
         * @namespace SubmenuBuilder
         */
        SubmenuBuilder: function (id, type, header) {
            /**
             * The HTML list representing the submenu.
             * @type {HTMLElement}
             * @memberof Menubar.SubmenuBuilder
             */
            this.element = document.createElement("div");
            this.element.className = "ldjs-menubar-submenu";
            this.element.id = "ldjs-menubar-submenu-" + id;
            var headerElement = document.createElement("header");
            headerElement.innerHTML = header || "";
            this.element.appendChild(headerElement);
            var buttonList = document.createElement(type === "ul" ? type : "ol");
            buttonList.className = "ldjs-menubar-submenu-buttons";
            this.element.appendChild(buttonList);

            /**
             * @param {HTMLElement} button the button to add
             * @see Menubar.createButton
             * @see Menubar.createIconButton
             * @see Menubar.createTextButton
             * @memberof Menubar.SubmenuBuilder
             */
            this.addButton = function (button) {
                buttonList.appendChild(Util.wrapInLi(button));
                return this;
            };
            /**
             * adds a list of buttons as an nested list to this submenu.
             * The inner array must contain the button on index 0 and a number indicating the hierarchy-level
             * on index 1
             * @param {Array<Array<HTMLElement|Number>>} buttonArray - an array of arrays, that contain an button
             *          and a hierarchy-number
             * @param {?Number} startDepth - the depth to start with (standard: 1)
             * @see Menubar.createButton
             * @see Menubar.createIconButton
             * @see Menubar.createTextButton
             * @memberof Menubar.SubmenuBuilder
             */
            this.addNestedButtons = function (buttonArray, startDepth) {
                buttonList.classList.add("nested");
                var currentList = buttonList;
                var currentDepth = (typeof startDepth === "undefined") ? 1 : startDepth;;
                buttonArray.forEach(function (buttonPair) {
                    var button = buttonPair[0];
                    var depth = buttonPair[1];

                    // we need to go deeper:
                    while (currentDepth < depth) {
                        var subList = document.createElement(type === "ul" ? type :
                            "ol");
                        subList.classList.add("nested");
                        currentList.appendChild(Util.wrapInLi(subList));
                        currentList = subList;
                        currentDepth++;
                    }
                    while (currentDepth > depth) {
                        currentList = currentList.parentNode.parentNode;
                        currentDepth--;
                    }
                    // now we can assume that currentDepth === depth
                    currentList.appendChild(Util.wrapInLi(button));
                    currentList.lastChild.classList.add("nested");
                });
            };
        },
        /**
         * Toggles the visibility of the submenu with the given id fragment.
         * <br>
         * The full id of the submenu and its toggle button are constructed from this fragment as
         * follows:
         * <dl>
         * <dt>submenu</dt><dd><code>"ldjs-menubar-submenu-" + id</code></dd>
         * <dt>button</dt><dd><code>"ldjs-menubar-button-toggle-submenu-" + id</code></dd>
         * </dl>
         * The submenu will be centered horizontally (as far as possible without cutting off parts)
         * over its toggle button. If either element cannot be found, the method fails silently.<br>
         * Showing a submenu this way will make the menu bar visible as well.<br>
         * Hiding a submenu this way will keep the menu bar visible.
         * @see Menubar.SubmenuBuilder
         * @see Menubar.centerHorizontallyOverElement
         * @memberof Menubar
         */
        toggleSubmenu: function (id) {
            return function (event) {
                var submenu = document.getElementById("ldjs-menubar-submenu-" + id);
                var button = document.getElementById(
                    "ldjs-menubar-button-toggle-submenu-" + id);
                if (!submenu || !button) return;
                if (Menubar.isVisible(submenu)) {
                    Menubar.hideSubmenu(submenu, button);
                    var isKeyEvent = event.type.search("^key") === 0;
                    if (Util.isInPresentationMode() && isKeyEvent) {
                        State.update({
                            isMenubarVisible: false
                        });
                    }
                } else {
                    if (id !== "asides" && !Menubar.isVisible()) {
                        State.update({
                            isMenubarVisible: true
                        });
                    }
                    Menubar.hideAllSubmenus();
                    Menubar.centerHorizontallyOverElement(submenu, button);
                    button.classList.add("active");
                    Menubar.show(submenu);
                }
            };
        },
        /**
         * Hides the given submenu and removes the "active" state from its button.
         * @param {HTMLElement} submenu the submenu to hide
         * @param {HTMLElement} button the button that toggles the submenu
         * @memberof Menubar
         */
        hideSubmenu: function (submenu, button) {
            Menubar.hide(submenu);
            if (button.action) {
                button.action.update();
                if (!button.action.isActive) {
                    button.classList.remove("active");
                }
            }
        },
        /**
         * Computes the value for the style attribute left that in conjunction with fixed
         * positioning will result in the menu being centered horizontally over the given
         * element.<br>
         * If the menu would overlap the right edge of the screen, it will be moved far enough
         * to the left so that it will be completely visible (given that its width is less
         * than the screen width).
         * @param {HTMLElement} menu the menu
         * @param {HTMLElement} element the element to center over
         * @memberof Menubar
         */
        centerHorizontallyOverElement: function (menu, element) {
            var left = Util.getOffset(element).left;
            left -= Math.ceil((menu.offsetWidth - element.offsetWidth) / 2);
            var right = left + menu.offsetWidth;
            var difference = Math.ceil(right - document.body.clientWidth + 15);
            if (difference > 0) {
                left -= difference;
            }
            menu.style.left = Math.max(0, left) + "px";
        }
    };

    /**
     * Provides an interface to read from and write to various storage locations.
     * <br>
     * At present, this includes the hash portion of the URL and the browser's local storage.
     * @namespace Storage
     */
    var Storage = {
        storageEnabled: true,
        /**
         * Internally used function to generate appropriate messages and logs
         * if local storage has been enabled or disabled since the last call.
         * @param {Boolean} stillEnabled true if access has been granted,
         * false otherwise.
         * @memberof Storage
         */
        storageAccessGranted: function (stillEnabled) {
            if (stillEnabled == Storage.storageEnabled) return;
            if (!stillEnabled) {
                log("Storage: local storage has been disabled", debug_ERROR);
                var msg = "<p>Your browser's local storage is disabled.</p>" +
                    "<p>LectureDoc stores some information such as the current presentation" +
                    " slide there. If you want to use LectureDoc's full persisting features," +
                    " please enable local storage and allow this site access to it.</p>"
                MessageBox.show("ldjs-storage-hint", "", "Info", msg, null, null, false);
            } else {
                log("Storage: local storage has been re-enabled", debug_ERROR);
            }
            Storage.storageEnabled = stillEnabled;
        },
        /**
         * @return {String} the key for this document's local storage access
         * @memberof Storage
         */
        getLocalStorageKey: function () {
            return "lecturedoc-state-" + window.location.pathname;
        },
        /**
         * Returns, if present, state previously stored in the browser's local storage.
         * @return {Object} a collection of properties to be applied to the State
         * @memberof Storage
         */
        readLocalStorage: function () {
            try {
                var result = JSON.parse(window.localStorage.getItem(
                    Storage.getLocalStorageKey()));
                Storage.storageAccessGranted(true);
                return result;
            } catch (e) {
                Storage.storageAccessGranted(false);
                return {};
            }
        },
        /**
         * Writes the applicationState properties from the given state object to the local storage.
         * <br>Typically the state object will be State, but could be any object that exposes
         * a getApplicationState method.
         * <br>
         * @param {Object} state the state object to read from
         * @memberof Storage
         */
        writeLocalStorage: function (state) {
            try {
                var key = Storage.getLocalStorageKey();
                var data = state.getApplicationState();
                window.localStorage.setItem(key, JSON.stringify(data));
                Storage.storageAccessGranted(true);
            } catch (e) {
                Storage.storageAccessGranted(false);
            }
        },
        /**
         * Returns properties from the hash portion of the URL.
         * <br>
         * The format for properties is the following:
         * <pre>property=value&property2=othervalue</pre>
         * @param {String} hash the hash to read from (typically window.location.hash)
         * @memberof Storage
         */
        readHash: function (hash) {
            log("Storage: reading url hash part");
            if (hash[0] === "#") hash = hash.substring(1);
            var pairs = hash.split("&").map(function (pair) {
                return pair.split("=");
            });
            var result = {};
            pairs.forEach(function (pair) {
                if (!pair || !pair.length || pair.length < 2) {
                    return;
                }
                if (isFinite(pair[1])) { // isFinite implies isNumber
                    pair[1] = parseFloat(pair[1]);
                }
                result[pair[0]] = pair[1];
            });
            return result;
        },
        /**
         * Creates a string that will be parsed correctly by {@link Storage.readHash}.
         * @param {Object} state the state object to read from (typically State)
         * @return {String} the hash string
         * @see Storage.readHash
         * @memberof Storage
         */
        buildHash: function (state) {
            log("Storage: building hash");
            var keys = ["mode"];
            switch (state.get("mode")) {
            case "presentation":
                keys = keys.concat(["currentSlide", "presentationZoomFactor"]);
                break;
            case "lighttable":
                keys = keys.concat(["lightTableZoomFactor"]);
                break;
            }
            return keys.map(function (k) {
                return k + "=" + state.get(k);
            }).join("&");
        }
    };

    /**
     * @namespace Actions
     */
    var Actions = {
        /**
         * Reads properties from local storage and URL and updates the state object.
         * @type Action
         * @memberof Actions
         */
        StateReader: new ActionBuilder().setExecute(function (state) {
            var local = Storage.readLocalStorage() || {};
            if (document.body.dataset.ldjsLastModified) {
                local["lastModified"] = new Date(Number(document.body.dataset.ldjsLastModified));
            }
            var hash = Storage.readHash(window.location.hash);
            state.update(Util.merge(local, hash));
        }).buildAction(),

        /**
         * Writes properties to the URL (hash) and local storage.
         * @type Action
         * @memberof Actions
         */
        StateWriter: new ActionBuilder().setExecute(function (state, changed) {
            window.location.hash = Storage.buildHash(state);
            Storage.writeLocalStorage(state);
        }).buildAction(),

        /**
         * Initialize other actions; should be called only after the document
         * has been analyzed and state has been fully initialized as some
         * actions depend on it.
         * @memberof Actions
         * @namespace initialize
         */
        initialize: function () {
            /**
             * Returns true if the slide navigation actions
             * (next/prev/jump/first/last) should be enabled.
             * @memberof Actions.initialize
             */

            function isNavigationActionEnabled() {
                return Util.isInPresentationMode();
            }
            /**
             * Action to advance to the next slide.
             * (Notice &lt;enter&gt; is being handled by {@link
             * Actions.JumpToSlideAction}.)
             * @memberof Actions
             */
            Actions.NextSlideAction = new ActionBuilder("nextSlide").
            setEnabled(isNavigationActionEnabled).setExecute(function (event, combo) {
                if (combo == "enter" && document.querySelector(".ldjs-message-box"))
                    return;
                State.update({
                    currentSlide: State.get("currentSlide") + 1
                });
            }).setKeyStrokes(["right", "down", "pagedown", "space", "enter"]).buildAction();
            /** 
             * Action to go back one slide.
             * @memberof Actions
             */
            Actions.PreviousSlideAction = new ActionBuilder("previousSlide").
            setEnabled(isNavigationActionEnabled).setExecute(function () {
                State.update({
                    currentSlide: State.get("currentSlide") - 1
                });
            }).setKeyStrokes(["left", "up", "pageup"]).buildAction();
            /**
             * Action to jump to the first slide.
             * @memberof Actions
             */
            Actions.FirstSlideAction = new ActionBuilder("firstSlide").
            setEnabled(isNavigationActionEnabled).setExecute(Util.jumpToSlide(0)).
            setKeyStrokes(["f"]).buildAction();
            /**
             * Action to jump to the last (user defined) slide.
             * @memberof Actions
             */
            Actions.LastSlideAction = new ActionBuilder("lastSlide").
            setEnabled(isNavigationActionEnabled).setExecute(function (event) {
                if (Menubar.isVisible("ldjs-menubar-submenu-modes") &&
                    event.type.search("^key") === 0) {
                    return;
                }
                Util.jumpToSlide(State.get("theSlides").length - 1)()
            }).setKeyStrokes(["l"]).buildAction();
            /**
             * Action to toggle the help dialog.
             * @memberof Actions
             */
            Actions.HelpAction = new ActionBuilder("help").setIcon("help").
            setVisible(true).setKeyStrokes(["h"]).setExecute(function () {
                MessageBox.show("ldjs-help", "", "Help", State.get("helpNode").innerHTML,
                    null, null, true);
            }).buildAction();

            /**
             * Creates an Action with the given id, label, and icon, that
             * toggles the overlay layer with the given color. If the layer is
             * active and has the given color, it will be hidden.
             * Otherwise it will be set to the given color and made visible. The
             * Action will only be visible and enabled in presentation mode.
             * @param {String} color the overlay's color
             * @param {String|Function} id {@link Action}
             * @param {String|Function} label {@link Action}
             * @param {String|Function} icon {@link Action}
             * @memberof Actions.initialize
             */

            function createOverlayAction(color, id, label, icon) {
                return new ActionBuilder(id).setEnabled(Util.isInPresentationMode).
                setLabel(label).setIcon(icon).setKeyStrokes([id[0]]).
                setVisible(Util.isInPresentationMode).setExecute(function () {
                    if (State.get("isOverlayActive") && State.get("overlayLayerColor") ===
                        color) {
                        State.update({
                            isOverlayActive: false
                        });
                    } else {
                        State.update({
                            overlayLayerColor: color,
                            isOverlayActive: true
                        });
                    }
                }).setActive(function () {
                    var result = State.get("isOverlayActive") && State.get(
                        "overlayLayerColor") === color;
                    return result;
                }).buildAction();
            }
            /**
             * @memberof Actions
             */
            Actions.BlackoutAction = createOverlayAction("black", "blackout", "Blackout",
                "blackout");
            /**
             * @memberof Actions
             */
            Actions.WhiteoutAction = createOverlayAction("white", "whiteout", "Whiteout",
                "whiteout");

            /**
             * Creates an action to switch to a render mode.
             * @param {String} mode the name of the mode
             * @param {String} label the label to use for the action
             * @return an Action that switches to the given mode
             * @memberof Actions.initialize
             */

            function switchModeAction(mode, label) {
                return new ActionBuilder(mode + "Mode").
                setLabel("<span style=\"text-decoration: underline\">" + label[0] +
                    "</span>" +
                    label.substring(1)).
                setExecute(function () {
                    State.update({
                        mode: mode
                    });
                }).setActive(function () {
                    return State.get("mode") === mode;
                }).setEnabled(function () {
                    return State.get("theSlides").length > 0;
                }).buildAction();
            }

            /**
             * @memberof Actions
             */
            Actions.PresentationModeAction = switchModeAction("presentation",
                "Presentation");
            /**
             * @memberof Actions
             */
            Actions.DocumentModeAction = switchModeAction("document", "Document");
            /**
             * @memberof Actions
             */
            Actions.NotesModeAction = switchModeAction("notes", "Notes");
            /**
             * @memberof Actions
             */
            Actions.LightTableModeAction = switchModeAction("lighttable", "Light Table");
            /**
             * @memberof Actions
             */
            Actions.ContinuousModeAction = switchModeAction("continuous", "Continuous");

            Actions.PrintAction = new ActionBuilder("print").setIcon("print").
            setKeyStrokes(["mod+p"]).setExecute(function (event) {
                var title = "Tips for printing in LectureDoc";
                var message = "";
                switch (State.get("mode")) {
                case "document":
                    message +=
                        "<p>Printing in this mode is only supported in <b>portrait</b>" +
                        " <span class=\"portrait\"></span> orientation.</p>";
                    break;
                case "continuous":
                    message +=
                        "<p>Printing in this mode is only supported in <b>landscape</b>" +
                        " <span class=\"landscape\"></span> orientation.</p>";
                    break;
                case "presentation":
                case "lighttable":
                case "notes":
                default:
                    message +=
                        "<p>Printing in this mode is currently <b>not supported</b>.</p>";
                    break;
                }
                message += "<ul>" +

                "<li>To print a <b>script-like document</b>, switch to <b>standard document mode</b>.</li>" +
                    "<li>To print <b>one slide</b> per page, e.g. for creating a PDF, switch to" +
                    "<b>continuous mode</b>.</li>" +
                    "</ul>";
                MessageBox.show("ldjs-print-dialog", "", title, message, {
                    getLabel: "Print",
                    execute: function () {
                        MessageBox.hide("ldjs-print-dialog");
                        window.print();
                    }
                }, {
                    getLabel: "Abort",
                    execute: function () {}
                }, true);

                event.preventDefault();
                event.stopPropagation();
            }).buildAction();
        },
        /**
         * @memberof Actions
         */
        bindKeys: function () {
            Gator(document).on("keyup", function (event) {
                var modes = document.querySelector("#ldjs-menubar-submenu-modes");
                if (!Menubar.isVisible(modes)) return;
                switch (String.fromCharCode(event.keyCode)) {
                case 'P':
                case 'p':
                    Menubar.toggleSubmenu("modes")(event);
                    Actions.PresentationModeAction.execute(event);
                    break;
                case 'D':
                case 'd':
                    Menubar.toggleSubmenu("modes")(event);
                    Actions.DocumentModeAction.execute(event);
                    break;
                case 'N':
                case 'n':
                    Menubar.toggleSubmenu("modes")(event);
                    Actions.NotesModeAction.execute(event);
                    break;
                case 'L':
                case 'l':
                    Menubar.toggleSubmenu("modes")(event);
                    Actions.LightTableModeAction.execute(event);
                    break;
                case 'C':
                case 'c':
                    Menubar.toggleSubmenu("modes")(event);
                    Actions.ContinuousModeAction.execute(event);
                    break;
                }
            });
            Object.keys(Actions).forEach(function (name) {
                Events.bindKeys(Actions[name]);
            });
        }
    };

    function analyzeDocument() {
        log("LectureDoc: analyzing document");
        var changes = {
            "theSlides": initializeSlides(),
            "theDocumentBody": cloneDocument(),
            "theTableOfContents": initializeTableOfContents()
        };
        changes = Util.merge(changes, getSlideMetrics(changes["theSlides"]));
        State.update(changes);
    };

    function cloneDocument() {
        return document.body.cloneNode(true);
    };

    function initializeTableOfContents() {
        return Util.toArray(document.body.querySelectorAll(
            "#body-content>h1,#body-content>h2,#body-content>h3," +
            "#body-content>h4,#body-content>h5,#body-content>h6," +
            "#body-content > section.slide"
        ));
    }

    function initializeSlides() {
        var slides = Util.toArray(document.body.querySelectorAll("section.slide"));
        addSlideNumbers(slides);
        return slides;
    };

    /**
     * Adds consecutive slide numbers to the given slides.
     * @param {Array<HTMLElement>} slides the slides to work on
     * @memberof LectureDoc
     */

    function addSlideNumbers(slides) {
        slides.forEach(Util.addSlideNumber);
    };

    /**
     * Retrieves width and height from the given slides and stores the values as
     * State.
     * @param {Array<HTMLElement>} slides the slides to analyze
     * @memberof LectureDoc
     */

    function getSlideMetrics(slides) {
        if (!slides || !Array.isArray(slides) || slides.length === 0) return;
        var aSlideBody = slides[0].querySelector(".section-body");
        return {
            slideWidth: aSlideBody.offsetWidth,
            slideHeight: aSlideBody.offsetHeight,
            slideAspectRatio: aSlideBody.offsetWidth / aSlideBody.offsetHeight
        };
    }

    function loadState() {
        log("LectureDoc: loading state");
        Actions.StateReader.execute(State); // load state
        Actions.StateWriter.execute(State); // update URL and local storage with new state
        var hash = window.location.hash;
        window.setInterval(function () { // periodically poll URL hash for changes
            if (hash != window.location.hash) {
                State.update(Storage.readHash(window.location.hash));
                Actions.StateWriter.execute(State);
            }
            hash = window.location.hash;
        }, 500);
        State.addListener(Actions.StateWriter.execute); // automatically store changes to State
    };

    function setupConstraints() {
        log("LectureDoc: initializing constraints");
        // constrain slide numbers to those that are actually available
        State.addConstraint("currentSlide", function (key, newValue, oldValue) {
            var theSlides = State.get("theSlides");
            return theSlides && Array.isArray(theSlides) && newValue >= 0 && newValue <=
                theSlides.length;
        }, function (key, newValue, oldValue) {
            log("Constraints: no slide #" + newValue + " available", debug_ERROR);
        });
        // constrain slide numbers: no change when a modal dialog is active
        State.addConstraint("currentSlide", function (key, newValue, oldValue) {
            return !State.get("isModalDialogActive");
        }, function (key, newValue, oldValue) {
            log(
                "Constraints: when there is a modal dialog, slide switching " +
                "is not allowed", debug_ERROR
            );
        });
        // constrain modes: only allow defined modes
        State.addConstraint("mode", function (key, newValue, oldValue) {
            return Renderer.modes.hasOwnProperty(newValue);
        }, function (key, newValue, oldValue) {
            log("Constraints: unknown mode " + newValue, debug_ERROR);
        });
        // constrain modes: without slides, only document mode is available
        State.addConstraint("mode", function (key, newValue, oldValue) {
            var theSlides = State.get("theSlides");
            return theSlides && Array.isArray(theSlides) && (theSlides.length > 0 ||
                newValue === "document");
        }, function (key, newValue, oldValue) {
            log(
                "Constraints: only document mode is available when there are no slides",
                debug_ERROR
            );
        });
        // constrain zoom factors: factor must be a real number > 0 (not infinity, nan, ...)

        function validateZoom(key, newValue, oldValue) {
            return isFinite(newValue) && newValue > 0;
        }

        function invalidZoom(key, newValue, oldValue) {
            log("Constraints: zoom factor " + newValue + " is invalid", debug_ERROR);
        }
        State.addConstraint("presentationZoomFactor", validateZoom, invalidZoom);
        State.addConstraint("lightTableZoomFactor", validateZoom, invalidZoom);
    };

    function startUI() {
        log("LectureDoc: initializing UI");
        Events.initialize();
        Actions.initialize();
        State.addListener(function (state, modifiedProperties) {
            Renderer.render(modifiedProperties.mode.newValue);
            return {
                "isMenubarVisible": modifiedProperties.mode.newValue !==
                    "presentation"
            };
        }, "mode");
        State.addListener(function (state, modifiedProperties) {
            if (modifiedProperties.isOverlayActive) {
                if (modifiedProperties.isOverlayActive.newValue) {
                    var overlay = document.createElement("div");
                    overlay.id = "ldjs-overlay-layer";
                    overlay.className = State.get("overlayLayerColor") || "black";
                    if (State.get("isModalDialogActive")) {
                        overlay.classList.add("modal");
                    }
                    document.body.appendChild(overlay);
                } else {
                    var overlay = document.getElementById("ldjs-overlay-layer");
                    if (overlay) {
                        document.body.removeChild(overlay);
                    }
                }
            }
            if (modifiedProperties.overlayLayerColor) {
                if (State.get("isOverlayActive")) {
                    var overlay = document.getElementById("ldjs-overlay-layer");
                    overlay.classList.remove(modifiedProperties.overlayLayerColor.oldValue);
                    overlay.classList.add(modifiedProperties.overlayLayerColor.newValue);
                }
            }
            if (modifiedProperties.isModalDialogActive && modifiedProperties.isModalDialogActive
                .newValue) {
                if (State.get("isOverlayActive")) {
                    var overlay = document.getElementById("ldjs-overlay-layer");
                    overlay.classList.add("modal");
                }
            }
        }, ["isOverlayActive", "overlayLayerColor", "isModalDialogActive"]);
        State.addListener(function (state, modifiedProperties) {
            if (modifiedProperties.isModalDialogActive.newValue) {
                Events.blockKeyEvents();
            } else {
                Events.permitKeyEvents();
            }
        }, "isModalDialogActive");
        Renderer.initialize();
        Gator(window).on("resize", Util.manageScrollbars);
        Renderer.render(State.get("mode"));
        Menubar.initialize();
        document.body.appendChild(Menubar.element);
        Events.onClick('*', function (event) {
            var target = event.target;
            if (Util.isDescendant(Menubar.element, target)) return;
            var parent = target;
            while (parent) {
                if (parent.classList.contains("ldjs-message-box")) return;
                parent = parent.parentElement;
            }
            Menubar.hideAllSubmenus();
            if (Util.isInPresentationMode()) {
                State.update({
                    isMenubarVisible: false
                });
            }
        });
        Gator(document).on("keyup", function (event) {
            if (event.keyCode == 27) {
                var parent = event.target;
                while (parent) {
                    if (parent.classList.contains("ldjs-message-box")) return;
                    parent = parent.parentElement;
                }
                Menubar.hideAllSubmenus();
                if (Util.isInPresentationMode()) {
                    State.update({
                        isMenubarVisible: false
                    });
                }
            }
        });
        Actions.bindKeys();
        Events.bindKeys(Actions.PrintAction, "keydown");
    };
    /**
     * @namespace LectureDoc
     */
    var object = {
        init: function () {
            if (debug) {
                window.alert("LectureDoc is currently running in debug mode.");
            }
            log("LectureDoc: initializing LectureDoc");
            analyzeDocument();
            loadState();
            setupConstraints();
            startUI();
            log("LectureDoc: initializing LectureDoc finished");
        },
        /**
         * @typedef HelpData
         * @type object
         * @property {Array<HelpGroup>} content the actual help content
         * @property {String} [footer=LectureDoc © 2013, 2014 Michael Eichberg,
            Marco Jacobasch, Arne Lottmann, Daniel Killer, Simone Wälde, Kerstin Reifschläger,
            David Becker, Tobias Becker, Andre Pacak, Volkan Hacimüftüoglu]
         * the help dialog's footer (may contain HTML). Will be inserted into the dialog's FOOTER element
         */
        /**
         * Properties are pairs of action description and keyboard shortcuts (as
         * an Array)
         * @typedef HelpGroup
         * @type object
         */
        /**
         * Sets LectureDoc's help message.
         * @param {HelpData} the data to show in the help dialog
         * @memberof LectureDoc
         */
        setHelp: function (helpData) {
            Gator(window).on("DOMContentLoaded", function () {
                State.update({
                    helpNode: Util.buildHelpNode(helpData)
                });
            });
        }
    };
    return object;
}();

Gator(window).on("DOMContentLoaded", LectureDoc.init);
