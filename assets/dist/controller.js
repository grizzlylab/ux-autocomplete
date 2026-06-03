import { Controller } from '@hotwired/stimulus';
import TomSelect from 'tom-select';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var _default_1_instances, _default_1_getCommonConfig, _default_1_createAutocomplete, _default_1_createAutocompleteWithHtmlContents, _default_1_createAutocompleteWithRemoteData, _default_1_stripTags, _default_1_mergeObjects, _default_1_createTomSelect;
class default_1 extends Controller {
    constructor() {
        super(...arguments);
        _default_1_instances.add(this);
        this.isObserving = false;
        this.hasLoadedChoicesPreviously = false;
    }
    initialize() {
        if (this.requiresLiveIgnore()) {
            // unfortunately, TomSelect does enough weird things that, for a
            // multi select, if the HTML in the `<select>` element changes,
            // we can't reliably update TomSelect to see those changes. So,
            // as a workaround, we tell LiveComponents to entirely ignore trying
            // to update this item
            this.element.setAttribute('data-live-ignore', '');
            if (this.element.id) {
                const label = document.querySelector(`label[for="${this.element.id}"]`);
                if (label) {
                    label.setAttribute('data-live-ignore', '');
                }
            }
        }
        else {
            // for non-multiple selects, we use a MutationObserver to update
            // the TomSelect instance if the options themselves change
            if (!this.mutationObserver) {
                this.mutationObserver = new MutationObserver((mutations) => {
                    this.onMutations(mutations);
                });
            }
        }
    }
    connect() {
        if (this.urlValue) {
            this.tomSelect = __classPrivateFieldGet(this, _default_1_instances, "m", _default_1_createAutocompleteWithRemoteData).call(this, this.urlValue, this.hasMinCharactersValue ? this.minCharactersValue : null);
            return;
        }
        if (this.optionsAsHtmlValue) {
            this.tomSelect = __classPrivateFieldGet(this, _default_1_instances, "m", _default_1_createAutocompleteWithHtmlContents).call(this);
            return;
        }
        this.tomSelect = __classPrivateFieldGet(this, _default_1_instances, "m", _default_1_createAutocomplete).call(this);
        this.startMutationObserver();
    }
    disconnect() {
        this.stopMutationObserver();
        this.tomSelect.destroy();
    }
    getMaxOptions() {
        return this.selectElement ? this.selectElement.options.length : 50;
    }
    /**
     * Returns the element, but only if it's a select element.
     */
    get selectElement() {
        if (!(this.element instanceof HTMLSelectElement)) {
            return null;
        }
        return this.element;
    }
    /**
     * Getter to help typing.
     */
    get formElement() {
        if (!(this.element instanceof HTMLInputElement) && !(this.element instanceof HTMLSelectElement)) {
            throw new Error('Autocomplete Stimulus controller can only be used on an <input> or <select>.');
        }
        return this.element;
    }
    dispatchEvent(name, payload) {
        this.dispatch(name, { detail: payload, prefix: 'autocomplete' });
    }
    get preload() {
        if (!this.hasPreloadValue) {
            return 'focus';
        }
        if (this.preloadValue == 'false') {
            return false;
        }
        if (this.preloadValue == 'true') {
            return true;
        }
        return this.preloadValue;
    }
    resetTomSelect() {
        if (this.tomSelect) {
            this.stopMutationObserver();
            this.tomSelect.clearOptions();
            this.tomSelect.settings.maxOptions = this.getMaxOptions();
            this.tomSelect.sync();
            this.startMutationObserver();
        }
    }
    changeTomSelectDisabledState(isDisabled) {
        this.stopMutationObserver();
        if (isDisabled) {
            this.tomSelect.disable();
        }
        else {
            this.tomSelect.enable();
        }
        this.startMutationObserver();
    }
    /**
     * TomSelect doesn't give us a way to update the placeholder, so most of
     * this code is copied from TomSelect's source code.
     *
     * @private
     */
    updateTomSelectPlaceholder() {
        const input = this.element;
        let placeholder = input.getAttribute('placeholder') || input.getAttribute('data-placeholder');
        if (!placeholder && !this.tomSelect.allowEmptyOption) {
            const option = input.querySelector('option[value=""]');
            if (option) {
                placeholder = option.textContent;
            }
        }
        if (placeholder) {
            this.stopMutationObserver();
            // override settings so it's used again later
            this.tomSelect.settings.placeholder = placeholder;
            // and set it right now
            this.tomSelect.control_input.setAttribute('placeholder', placeholder);
            this.startMutationObserver();
        }
    }
    startMutationObserver() {
        if (!this.isObserving && this.mutationObserver) {
            this.mutationObserver.observe(this.element, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true,
            });
            this.isObserving = true;
        }
    }
    stopMutationObserver() {
        if (this.isObserving && this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.isObserving = false;
        }
    }
    onMutations(mutations) {
        const addedOptionElements = [];
        const removedOptionElements = [];
        let hasAnOptionChanged = false;
        let changeDisabledState = false;
        let changePlaceholder = false;
        mutations.forEach((mutation) => {
            switch (mutation.type) {
                case 'childList':
                    // look for changes to any <option> elements - e.g. text
                    if (mutation.target instanceof HTMLOptionElement) {
                        if (mutation.target.value === '') {
                            changePlaceholder = true;
                            break;
                        }
                        hasAnOptionChanged = true;
                        break;
                    }
                    // look for new or removed <option> elements
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof HTMLOptionElement) {
                            // check if a previously-removed is being added back
                            if (removedOptionElements.includes(node)) {
                                removedOptionElements.splice(removedOptionElements.indexOf(node), 1);
                                return;
                            }
                            addedOptionElements.push(node);
                        }
                    });
                    mutation.removedNodes.forEach((node) => {
                        if (node instanceof HTMLOptionElement) {
                            // check if a previously-added is being removed
                            if (addedOptionElements.includes(node)) {
                                addedOptionElements.splice(addedOptionElements.indexOf(node), 1);
                                return;
                            }
                            removedOptionElements.push(node);
                        }
                    });
                    break;
                case 'attributes':
                    // look for changes to any <option> elements (e.g. value attribute)
                    if (mutation.target instanceof HTMLOptionElement) {
                        hasAnOptionChanged = true;
                        break;
                    }
                    if (mutation.target === this.element && mutation.attributeName === 'disabled') {
                        changeDisabledState = true;
                        break;
                    }
                    break;
                case 'characterData':
                    // an alternative way for an option's text to change
                    if (mutation.target instanceof Text && mutation.target.parentElement instanceof HTMLOptionElement) {
                        if (mutation.target.parentElement.value === '') {
                            changePlaceholder = true;
                            break;
                        }
                        hasAnOptionChanged = true;
                    }
            }
        });
        if (hasAnOptionChanged || addedOptionElements.length > 0 || removedOptionElements.length > 0) {
            this.resetTomSelect();
        }
        if (changeDisabledState) {
            this.changeTomSelectDisabledState(this.formElement.disabled);
        }
        if (changePlaceholder) {
            this.updateTomSelectPlaceholder();
        }
    }
    requiresLiveIgnore() {
        return this.element instanceof HTMLSelectElement && this.element.multiple;
    }
}
_default_1_instances = new WeakSet(), _default_1_getCommonConfig = function _default_1_getCommonConfig() {
    const plugins = {};
    // multiple values excepted if this is NOT A select (i.e. input) or a multiple select
    const isMultiple = !this.selectElement || this.selectElement.multiple;
    if (!this.formElement.disabled && !isMultiple) {
        plugins.clear_button = { title: '' };
    }
    if (isMultiple) {
        plugins.remove_button = { title: '' };
    }
    if (this.urlValue) {
        plugins.virtual_scroll = {};
    }
    const render = {
        no_results: () => {
            return `<div class="no-results">${this.noResultsFoundTextValue}</div>`;
        },
    };
    const requiresLiveIgnore = this.requiresLiveIgnore();
    const config = {
        render,
        plugins,
        // clear the text input after selecting a value
        onItemAdd: () => {
            this.tomSelect.setTextboxValue('');
        },
        // see initialize() method for explanation
        onInitialize: function () {
            if (requiresLiveIgnore) {
                const tomSelect = this;
                tomSelect.wrapper.setAttribute('data-live-ignore', '');
            }
        },
        closeAfterSelect: true,
    };
    // for non-autocompleting input elements, avoid the "No results" message that always shows
    if (!this.selectElement && !this.urlValue) {
        config.shouldLoad = () => false;
    }
    return __classPrivateFieldGet(this, _default_1_instances, "m", _default_1_mergeObjects).call(this, config, this.tomSelectOptionsValue);
}, _default_1_createAutocomplete = function _default_1_createAutocomplete() {
    const config = __classPrivateFieldGet(this, _default_1_instances, "m", _default_1_mergeObjects).call(this, __classPrivateFieldGet(this, _default_1_instances, "m", _default_1_getCommonConfig).call(this), {
        maxOptions: this.getMaxOptions(),
    });
    return __classPrivateFieldGet(this, _default_1_instances, "m", _default_1_createTomSelect).call(this, config);
}, _default_1_createAutocompleteWithHtmlContents = function _default_1_createAutocompleteWithHtmlContents() {
    const config = __classPrivateFieldGet(this, _default_1_instances, "m", _default_1_mergeObjects).call(this, __classPrivateFieldGet(this, _default_1_instances, "m", _default_1_getCommonConfig).call(this), {
        maxOptions: this.getMaxOptions(),
        score: (search) => {
            const scoringFunction = this.tomSelect.getScoreFunction(search);
            return (item) => {
                // strip HTML tags from each option's searchable text
                return scoringFunction(Object.assign(Object.assign({}, item), { text: __classPrivateFieldGet(this, _default_1_instances, "m", _default_1_stripTags).call(this, item.text) }));
            };
        },
        render: {
            item: function (item) {
                return `<div>${item.text}</div>`;
            },
            option: function (item) {
                return `<div>${item.text}</div>`;
            },
        },
    });
    return __classPrivateFieldGet(this, _default_1_instances, "m", _default_1_createTomSelect).call(this, config);
}, _default_1_createAutocompleteWithRemoteData = function _default_1_createAutocompleteWithRemoteData(autocompleteEndpointUrl, minCharacterLength) {
    const config = __classPrivateFieldGet(this, _default_1_instances, "m", _default_1_mergeObjects).call(this, __classPrivateFieldGet(this, _default_1_instances, "m", _default_1_getCommonConfig).call(this), {
        firstUrl: (query) => {
            const separator = autocompleteEndpointUrl.includes('?') ? '&' : '?';
            return `${autocompleteEndpointUrl}${separator}query=${encodeURIComponent(query)}`;
        },
        // VERY IMPORTANT: use 'function (query, callback) { ... }' instead of the
        // '(query, callback) => { ... }' syntax because, otherwise,
        // the 'this.XXX' calls inside this method fail
        load: function (query, callback) {
            const url = this.getUrl(query);
            fetch(url)
                .then((response) => response.json())
                // important: next_url must be set before invoking callback()
                .then((json) => {
                this.setNextUrl(query, json.next_page);
                callback(json.results.options || json.results, json.results.optgroups || []);
            })
                .catch(() => callback([], []));
        },
        shouldLoad: (query) => {
            // if min length is specified, always use it
            if (null !== minCharacterLength) {
                return query.length >= minCharacterLength;
            }
            // otherwise, default to 3, but always load after the first request
            // this gives nice behavior when the user deletes characters and
            // goes below the minimum length, it will still load fresh choices
            if (this.hasLoadedChoicesPreviously) {
                return true;
            }
            // mark that the choices have loaded (but avoid initial load)
            if (query.length > 0) {
                this.hasLoadedChoicesPreviously = true;
            }
            return query.length >= 3;
        },
        optgroupField: 'group_by',
        // avoid extra filtering after results are returned
        score: function (search) {
            return function (item) {
                return 1;
            };
        },
        render: {
            option: (item, escape) => `<div>${this.optionsAsHtmlValue ? item.text : escape(item.text)}</div>`,
            item: (item, escape) => `<div>${this.optionsAsHtmlValue ? item.text : escape(item.text)}</div>`,
            no_more_results: () => {
                return `<div class="no-more-results">${this.noMoreResultsTextValue}</div>`;
            },
            no_results: () => {
                return `<div class="no-results">${this.noResultsFoundTextValue}</div>`;
            },
        },
        preload: this.preload,
    });
    return __classPrivateFieldGet(this, _default_1_instances, "m", _default_1_createTomSelect).call(this, config);
}, _default_1_stripTags = function _default_1_stripTags(string) {
    return string.replace(/(<([^>]+)>)/gi, '');
}, _default_1_mergeObjects = function _default_1_mergeObjects(object1, object2) {
    return Object.assign(Object.assign({}, object1), object2);
}, _default_1_createTomSelect = function _default_1_createTomSelect(options) {
    const preConnectPayload = { options };
    this.dispatchEvent('pre-connect', preConnectPayload);
    const tomSelect = new TomSelect(this.formElement, options);
    const connectPayload = { tomSelect, options };
    this.dispatchEvent('connect', connectPayload);
    return tomSelect;
};
default_1.values = {
    url: String,
    optionsAsHtml: Boolean,
    noResultsFoundText: String,
    noMoreResultsText: String,
    minCharacters: Number,
    tomSelectOptions: Object,
    preload: String,
};

export { default_1 as default };
