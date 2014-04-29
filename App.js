Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:{ html:'<a href="https://help.rallydev.com/apps/2.0rc2/doc/">App SDK 2.0rc2 Docs</a>'},
    
    _releasesWithFeatures: [],
    
    launch: function() {
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
        if (cardBoardConfig) {
            cardBoardConfig.destroy();
        }
    
    var columns = [];
    var uniqueColumns = [];
    
    _.each(this._releasesWithFeatures, function(rel){
        columns.push({value: rel._ref, columnHeaderConfig: {headerTpl: '{release}', headerData: {release: rel._refObjectName}}});
    });
    
    uniqueColumns = _.uniq(columns, 'value');
    console.log(uniqueColumns);
        
        var cardBoardConfig = {
            xtype: 'rallycardboard',
            types: ['PortfolioItem/Feature'],
            attribute: 'Release',
            fieldToDisplay: 'Release',
            cardConfig: {
                fields: []
            },
            columns: uniqueColumns,            
        };

        this.add(cardBoardConfig);
    }
    
});
