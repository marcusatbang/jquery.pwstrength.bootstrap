/*jslint browser: true, unparam: true */
/*global jQuery */

/*
* jQuery Password Strength plugin for Twitter Bootstrap
*
* Copyright (c) 2008-2013 Tane Piper
* Copyright (c) 2013 Alejandro Blanco
* Dual licensed under the MIT and GPL licenses.
*/

var ui = {};

(function ($, ui) {
    "use strict";

    ui.getContainer = function (options, $el) {
        var $container;

        $container = $(options.ui.container);
        if (!($container && $container.length === 1)) {
            $container = $el.parent();
        }
        return $container;
    };

    ui.findElement = function ($container, viewport, cssSelector) {
        if (viewport) {
            return $container.find(viewport).find(cssSelector);
        }
        return $container.find(cssSelector);
    };

    ui.getUIElements = function (options, $el) {
        var $container, result;

        if (options.instances.viewports) {
            return options.instances.viewports;
        }

        result = {};
        $container = ui.getContainer(options, $el);
        result.$progressbar = ui.findElement($container, options.ui.viewports.progress, "div.progress");
        if (!options.ui.showPopover) {
            result.$verdict = ui.findElement($container, options.ui.viewports.verdict, "span.password-verdict");
            result.$errors = ui.findElement($container, options.ui.viewports.errors, "ul.error-list");
        }

        options.instances.viewports = result;
        return result;
    };

    ui.initProgressBar = function (options, $el) {
        var $container = ui.getContainer(options, $el),
            progressbar = "<div class='progress'><div class='";

        if (!options.ui.bootstrap2) {
            progressbar += "progress-";
        }
        progressbar += "bar'></div></div>";

        if (options.ui.viewports.progress) {
            $container.find(options.ui.viewports.progress).append(progressbar);
        } else {
            $(progressbar).insertAfter($el);
        }
    };

    ui.initHelper = function (options, $el, html, viewport) {
        var $container = ui.getContainer(options, $el);
        if (viewport) {
            $container.find(viewport).append(html);
        } else {
            $(html).insertAfter($el);
        }
    };

    ui.initVerdict = function (options, $el) {
        ui.initHelper(options, $el, "<span class='password-verdict'></span>",
                        options.ui.viewports.verdict);
    };

    ui.initErrorList = function (options, $el) {
        ui.initHelper(options, $el, "<ul class='error-list'></ul>",
                        options.ui.viewports.errors);
    };

    ui.initPopover = function (options, $el, verdictText) {
        var placement = "auto top",
            html = "";

        if (options.ui.bootstrap2) { placement = "top"; }

        if (options.ui.showVerdicts && verdictText.length > 0) {
            html = "<h5><span class='password-verdict'>" + verdictText +
                "</span></h5>";
        }
        if (options.ui.showErrors) {
            html += "<div><ul class='error-list'>";
            $.each(options.instances.errors, function (idx, err) {
                html += "<li>" + err + "</li>";
            });
            html += "</ul></div>";
        }

        $el.popover("destroy");
        $el.popover({
            html: true,
            placement: placement,
            trigger: "manual",
            content: html
        });
        $el.popover("show");
    };

    ui.initUI = function (options, $el) {
        if (!options.ui.showPopover) {
            ui.initErrorList(options, $el);
            ui.initVerdict(options, $el);
        }
        // The popover can't be initialized here, it requires to be destroyed
        // and recreated every time its content changes, because it calculates
        // its position based on the size of its content
        ui.initProgressBar(options, $el);
    };

    ui.possibleProgressBarClasses = ["danger", "warning", "success"];

    ui.updateProgressBar = function (options, $el, cssClass, percentage) {
        var $progressbar = ui.getUIElements(options, $el).$progressbar,
            $bar = $progressbar.find(".progress-bar"),
            cssPrefix = "progress-";

        if (options.ui.bootstrap2) {
            $bar = $progressbar.find(".bar");
            cssPrefix = "";
        }

        $.each(ui.possibleProgressBarClasses, function (idx, value) {
            $bar.removeClass(cssPrefix + "bar-" + value);
        });
        $bar.addClass(cssPrefix + "bar-" + cssClass);
        $bar.css("width", percentage + '%');
    };

    ui.updateVerdict = function (options, $el, text) {
        var $verdict = ui.getUIElements(options, $el).$verdict;
        $verdict.text(text);
    };

    ui.updateErrors = function (options, $el) {
        var $errors = ui.getUIElements(options, $el).$errors,
            html = "";
        $.each(options.instances.errors, function (idx, err) {
            html += "<li>" + err + "</li>";
        });
        $errors.html(html);
    };

    ui.percentage = function (score, maximun) {
        var result = Math.floor(100 * score / maximun);
        result = result < 0 ? 0 : result;
        result = result > 100 ? 100 : result;
        return result;
    };

    ui.updateUI = function (options, $el, score) {
        var barCss, barPercentage, verdictText;

        barPercentage = ui.percentage(score, options.ui.scores[3]);
        if (score <= 0) {
            barCss = "danger";
            verdictText = "";
        } else if (score < options.ui.scores[0]) {
            barCss = "danger";
            verdictText = options.ui.verdicts[0];
        } else if (score < options.ui.scores[1]) {
            barCss = "danger";
            verdictText = options.ui.verdicts[1];
        } else if (score < options.ui.scores[2]) {
            barCss = "warning";
            verdictText = options.ui.verdicts[2];
        } else if (score < options.ui.scores[3]) {
            barCss = "warning";
            verdictText = options.ui.verdicts[3];
        } else {
            barCss = "success";
            verdictText = options.ui.verdicts[4];
        }

        ui.updateProgressBar(options, $el, barCss, barPercentage);
        if (options.ui.showPopover) {
            // Popover can't be updated, it has to be recreated
            ui.initPopover(options, $el, verdictText);
        } else {
            if (options.ui.showVerdicts) {
                ui.updateVerdict(options, $el, verdictText);
            }
            if (options.ui.showErrors) {
                ui.updateErrors(options, $el);
            }
        }
    };
}(jQuery, ui));
