sap.ui.define([
	"acn/logistics/PurchasingPlanCockpit/controller/NewPlan.controller",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function(
	newPlanController
) {
	"use strict";

		/*QUnit.module("Initialization", {*/

		QUnit.test("Test on NewPlan controller", function (assert) {

			newPlanController = new newPlanController();
			var returnValue = newPlanController.just4Testing(2);
			assert.strictEqual(2, returnValue, "The returned value is the expected");
		});

});