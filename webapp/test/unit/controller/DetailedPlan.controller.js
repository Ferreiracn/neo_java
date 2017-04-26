sap.ui.define([
	"acn/logistics/PurchasingPlanCockpit/controller/DetailedPlan.controller",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function(
	detailedPlanController
) {
	"use strict";

		/*QUnit.module("Initialization", {*/

		QUnit.test("Test on detailed Plan controller", function (assert) {

			detailedPlanController = new detailedPlanController();
			var returnValue = detailedPlanController.just4Testing(2);
			assert.strictEqual(2, returnValue, "The returned value is the expected");
		});

});