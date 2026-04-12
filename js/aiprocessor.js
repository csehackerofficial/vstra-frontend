/**
 * @file aiProcessor.js
 * @description Utility functions for data formatting.
 */

/**
 * Truncates long product titles for uniform card layouts.
 */
window.cleanAI = (titleText) => {
    if (!titleText) return "VASTRA Premium Selection";
    const wordLimit = 6;
    const words = titleText.split(' ');
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(' ') + "...";
    }
    return titleText;
};