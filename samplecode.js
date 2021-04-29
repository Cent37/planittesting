let common = require("../../../../extension/common.js");

module.exports = common({

    name: "AUTO_HP_RPM_RV_Groupings",
    author: "Vincent Angelo Tuazon",

    before: browser => {
        global.mainPage = browser.page.common.main();
        global.resourceViewPage = browser.page.resourceManagement.resourceView();

        /* global , mainPage, resourceViewPage, LOGGER*/
    },

    "Happy Path - Resource Management - Resource View - Groupings": client => {

        if (databaseData.recordSet.settings.security.roles[0].overview.navigationTree.resourceManagement.resourceView) {

            //Navigate to Resource Management > Resource View
            LOGGER("Navigate to Resource View");
            mainPage.navigateTo("ResourceView");
            client.WaitForPageLoad();

            var x;
            var orgCount;

            resourceViewPage.click("@detailsView_findResourcesPane_ClearAllLnk");
            resourceViewPage.click("@detailsView_findResourcesPane_SearchBtn").WaitForPageLoad();
            client.WaitForPageLoad();

            resourceViewPage.click("@detailsView_mainScreen_ColumnSettingsSelectionBtn").WaitForPageLoad();
            LOGGER("Set Groupings to Organization");
            mainPage.waitForElementVisible("@dialog_columnSettingsAndSelectionsLbl")
                .SelectItemDropdown("@dialog_columnSettingsAndSelections_GroupByCmbbox", "Organization")
                .click("@dialog_columnSettingsAndSelections_ApplyBtn")
                .WaitForPageLoad();
            resourceViewPage.click("@detailsView_findResourcesPane_SearchBtn").WaitForPageLoad();

            LOGGER("Check and Compare Organization Count");
            resourceViewPage.GetActualRowCount("div#splitter3 div#groupGrid", loopCount =>{
                for (x = 1; x <= loopCount; x++) { 
                    resourceViewPage.GetCellValue("div#splitter3", "GroupDesc", x, result =>{
                        var orgStr = result.match(/\((.*)\)/); 
                        orgCount = parseInt(orgStr[1], 10);        
                    });
            
                    resourceViewPage.SelectRow("div#splitter3", x).WaitForPageLoad();        
                    client.perform(function() {
                        resourceViewPage.GetActualRowCount("@detailsView_mainScreen_WBSGrd", row =>{
                            if (row === orgCount) {
                                console.log("Row count matches Org count");
                            } else {
                                throw new Error("Bug 1140706");
                            }            
                        });
                    });
                }
            });

            LOGGER("Use Utilization then Search");
            resourceViewPage.SelectItemByIndexCombobox("@detailsView_findResourcesPane_UtilizationCmbbox", 1);
            resourceViewPage.click("@detailsView_findResourcesPane_SearchBtn").WaitForPageLoad();

            LOGGER("Check and Compare Organization Count");
            mainPage.waitForElementPresent("@statusMessage", "Group counts do not display when search includes Utilization.")
            mainPage.click("@statusMessage");
        }
    }
});