Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:{ html:'<a href="https://help.rallydev.com/apps/2.0rc2/doc/">App SDK 2.0rc2 Docs</a>'},
    
    _releasesWithFeatures: [],
    _uniqueColumns: [],
    _additionalColumns: [],
    _updatedColumns: [],
    _cardBoard: null,
    
    launch: function() {
        var that = this;
        this._releasePicker = Ext.create('Rally.ui.picker.MultiObjectPicker', {
            fieldLabel: 'Choose a Release',
            modelType: 'Release'
        });
        this.add(this._releasePicker);
        
        this.add({
            xtype: 'rallybutton',
            id: 'getReleases',
            text: 'Add Selected Releases',
            handler: function(){
                that._getSelectedReleases();
            }
        })

        Ext.create('Rally.data.WsapiDataStore', {
            model: 'PortfolioItem/Feature',
            fetch: ['FormattedID','Name','Release'],
            pageSize: 100,
            autoLoad: true,
            filters: [
                {
                    property: 'Release',
                    operator: '!=',
                    value: null
                }
            ],
            listeners: {
                load: this._onScheduledFeaturesLoaded,
                scope: this
            }
        }); 
    },
    _onScheduledFeaturesLoaded: function(store, data){
        var that = this;
        if (data.length !==0) {
            _.each(data, function(feature){
                console.log('feature ', feature.get('FormattedID'), 'scheduled for ', feature.get('Release')._refObjectName, feature.get('Release')._ref);
                that._releasesWithFeatures.push(feature.get('Release'))
            });
            console.log('releases with features', that._releasesWithFeatures);
            that._makeBoard();
        }
        else{
            console.log('there are no features scheduled for a release')
        }
    },
    _makeBoard: function(){
       if (this._cardBoard) {
            this._cardBoard.destroy();
        }
    
        var columns = [];
    
        _.each(this._releasesWithFeatures, function(rel){
            columns.push({value: rel._ref, columnHeaderConfig: {headerTpl: '{release}', headerData: {release: rel._refObjectName}}});
        });
    
        this._uniqueColumns = _.uniq(columns, 'value');
        console.log(this._uniqueColumns);
            
            var cardBoard = {
                xtype: 'rallycardboard',
                itemId: 'piboard',
                types: ['PortfolioItem/Feature'],
                attribute: 'Release',
                fieldToDisplay: 'Release',
                cardConfig: {
                    fields: []
                },
                columns: this._uniqueColumns           
            };
    
            this._cardBoard = this.add(cardBoard);
    },
    
    _getSelectedReleases: function(){
        var that = this;
        var expandedColumns = [];
        var selectedReleases = this._releasePicker._getRecordValue();
        console.log(selectedReleases.length);
        if (selectedReleases.length > 0) {
            _.each(selectedReleases, function(rel) {
                var releaseName = rel.get('Name');
                var releaseRef = rel.get('_ref');
                that._additionalColumns.push({value: releaseRef, columnHeaderConfig: {headerTpl: '{release}', headerData: {release: releaseName}}});
            });
        }
        console.log(that._additionalColumns);
        expandedColumns =  _.union(that._uniqueColumns, that._additionalColumns);
        console.log('expandedColumns',expandedColumns);
        this._updatedColumns = _.uniq(expandedColumns, 'value');
        console.log('this._updatedColumns',this._updatedColumns);
        this._updateBoard();
        
        
    },

    _updateBoard: function(){
        var that = this;
        
        if (this._cardBoard) {
            this._cardBoard.destroy();
        }
        var cardBoard = {
            xtype: 'rallycardboard',
            types: ['PortfolioItem/Feature'],
            attribute: 'Release',
            fieldToDisplay: 'Release',
            cardConfig: {
                fields: []
            },
            columns: that._updatedColumns,            
        };

        this._cardBoard = this.add(cardBoard);
        
    }
    
});
