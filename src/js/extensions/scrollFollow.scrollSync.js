'use strict';

/**
 * @fileoverview Implements Scroll Follow Extension ScrollSync Module
 * @author
 */

var MAX_SECTION_RATIO = 0.9;

/**
 * ScrollSync
 * @exports ScrollSync
 * @augments
 * @constructor
 * @class
 * @param {SectionManager} sectionManager sectionManager
 * @param {CodeMirror} cm codemirror
 * @param {jQuery} $previewContainerEl preview container
 */
function ScrollSync(sectionManager, cm, $previewContainerEl) {
    this.sectionManager = sectionManager;
    this.cm = cm;
    this.$previewContainerEl = $previewContainerEl;
}

/**
 * _getEditorSectionHeight
 * get section height of editor
 * @param {object} section section be caculated height
 * @return {number}
 */
ScrollSync.prototype._getEditorSectionHeight = function(section) {
    return this.cm.heightAtLine(section.end, 'local') - this.cm.heightAtLine(section.start > 0 ? section.start - 1 : 0, 'local');
};

/**
 * _getLineHeightGapInSection
 * get height gap between passed line in passed section
 * @param {object} section section be caculated
 * @param {number} line line number
 * @return {number}
 */
ScrollSync.prototype._getLineHeightGapInSection = function(section, line) {
    var gap = this.cm.heightAtLine(line, 'local') - this.cm.heightAtLine(section.start > 0 ? section.start - 1 : 0, 'local');
    return Math.max(gap, 0);
};

/**
 * _getSectionScrollRatio
 * get ratio of height between scrollTop line and scrollTop section
 * @param {object} section section be caculated
 * @param {number} line line number
 * @return {number}
 */
ScrollSync.prototype._getSectionScrollRatio = function(section, line) {
    var ratio;

    if (section.end !== section.start) {
        ratio = this._getLineHeightGapInSection(section, line) / this._getEditorSectionHeight(section);
    } else if (section.end === section.start) {
        ratio = 0;
    }

    return ratio > 0 ? Math.min(ratio, MAX_SECTION_RATIO) : 0;
};

/**
 * _getScrollFactorsOfEditor
 * get Scroll Information of editor for preivew scroll sync
 * @return {undefined}
 */
ScrollSync.prototype._getScrollFactorsOfEditor = function() {
    var topLine, topSection, ratio, isEditorBottom,
        cm = this.cm,
        scrollInfo = cm.getScrollInfo();

    isEditorBottom = scrollInfo.height - scrollInfo.top <= scrollInfo.clientHeight;

    if(isEditorBottom) {
        return {
            isEditorBottom : isEditorBottom
        };
    }

    topLine = cm.coordsChar({left: scrollInfo.left, top: scrollInfo.top}, 'local').line;

    topSection = this.sectionManager.sectionByLine(topLine);

    ratio = this._getSectionScrollRatio(topSection, topLine);

    return {
        section: topSection,
        sectionRatio: ratio
    };
};

/**
 * syncToPreview
 * sync preview with markdown scroll
 */
ScrollSync.prototype.syncToPreview = function() {
    var scrollTop, scrollFactors, section, ratio;

    scrollFactors = this._getScrollFactorsOfEditor();
    section = scrollFactors.section,
    ratio = scrollFactors.sectionRatio;

    if (scrollFactors.isEditorBottom) {
        scrollTop = this.$previewContainerEl.find('.previewContent').height()
    } else {
        scrollTop = section.$previewSectionEl[0].offsetTop + (section.$previewSectionEl.height() * ratio);
    }

    this.$previewContainerEl.scrollTop(scrollTop);
};

module.exports = ScrollSync;