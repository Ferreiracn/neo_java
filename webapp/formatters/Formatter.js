jQuery.sap.declare("formatters.Formatter");

formatters.Formatter = {
	formatRow: function(description, quantityYear3) {
		var cells = this.getParent().getCells();
		var row = this.getParent();
		row.destroyCustomData();
		
		//If is a materialGroup
		if(description && !quantityYear3) {
			row.addCustomData(new sap.ui.core.CustomData({
				key: "customStyle", 
				value: "MaterialGroup", 
				writeToDom: true
			}));
		}
		else {
			row.addCustomData(new sap.ui.core.CustomData({
				key: "customStyle", 
				value: "Material", 
				writeToDom: true
			}));
		}

		return description;
	},

	formatIcon: function(percentage3YearAvg) {

		if (percentage3YearAvg < 0) {
			this.setSrc("sap-icon://trend-down");
			this.removeStyleClass("black").removeStyleClass("redArrow").addStyleClass("greenArrow");    
		  

		}
			if (percentage3YearAvg == 0) {
			this.setSrc("sap-icon://less");
			this.removeStyleClass("greenArrow").removeStyleClass("redArrow").addStyleClass("black");    


		}
		
				if (percentage3YearAvg > 0) {
			this.setSrc("sap-icon://trend-up");
			this.removeStyleClass("black").removeStyleClass("greenArrow").addStyleClass("redArrow");    


		}

	},
	
		formatIcon2   : function(percentageLastYear) {

		if (percentageLastYear < 0) {
			this.setSrc("sap-icon://trend-down");
			this.removeStyleClass("black").removeStyleClass("redArrow").addStyleClass("greenArrow");    


		} 
			if (percentageLastYear == 0) {
			this.setSrc("sap-icon://less");
			this.removeStyleClass("greenArrow").removeStyleClass("redArrow").addStyleClass("black");    


		}
		
				if (percentageLastYear > 0) {
			this.setSrc("sap-icon://trend-up");
			this.removeStyleClass("black").removeStyleClass("greenArrow").addStyleClass("redArrow");    


		}

	}


	

};