    #target photoshop

    //close all images before doing this process
    if(app.documents.length > 0){
            alert("Close all open documents befor initiating the process", "Initializing....");
    } else {

    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.POINTS;

    var store = {
        activeLayer: null,
        rulerUnits: app.preferences.rulerUnits,
        typeUnits: app.preferences.typeUnits,
        font: null
    };

    //set foreground color
    app.foregroundColor.rgb.red = 0;
    app.foregroundColor.rgb.green = 0;
    app.foregroundColor.rgb.blue = 0;
    

    var inputFolder = Folder.selectDialog("Select a folder to process");
    var OutputFolder = Folder.selectDialog("Select folder to save images");
    var fileList = inputFolder.getFiles("*.JPG"); //Use whatever extension you want or no extension to select all files
    if(fileList.length >0){
        for(var i=0; i<fileList.length; i++) {
                var doc = open(fileList[i]);
                doc.suspendHistory("Add Reference Scale", "referenceScale()");
                doc.flatten();
                jpgSaveOptions = new JPEGSaveOptions(); 
                jpgSaveOptions.embedColorProfile = true; 
                jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE; 
                jpgSaveOptions.matte = MatteType.NONE; 
                jpgSaveOptions.bitsPerChannel = BitsPerChannelType.EIGHT;
                jpgSaveOptions.quality = 8;
                 // save and close             
                doc.saveAs(new File(OutputFolder+"/" + doc.name+'.jpg'),jpgSaveOptions, true,Extension.LOWERCASE);
                doc.close(SaveOptions.DONOTSAVECHANGES);
        }
        alert("Process completed successfully", "status");
    } else {
        alert("No images to process", "status");   
    }

}
    function referenceScale() 
    {

        magicWand(0,0);
        doc.selection.invert();
        selBounds = doc.selection.bounds;

        var halfMark = 5,
            txtMargin = 5,
            baseRes = 72,
            decimPlaces = 1,
            layerOpacity = 65,
            docRes = doc.resolution,
            scaleRatio = docRes / baseRes,
            scale = setScaleF(scaleRatio),
            realUnits = 'px',
            scaledUnits = 'pt',
            charThinSpace = '\u200A'; /* Thin space: \u2009, hair space: \u200A */
            
        var selX1 = selBounds[0].value,
            selX2 = selBounds[2].value - 1,
            selY1 = selBounds[1].value,
            selY2 = selBounds[3].value - 1;
            
        var selWidth = selX2 - selX1,
            selHeight = selY2 - selY1;        

        store.activeLayer = doc.activeLayer;
        doc.selection.deselect();
        var markLayer = doc.artLayers.add();
        var label = '';
        // Draw Main Line
        selY2= selY2 + 10;
        width = 2;
        // Draw main bottom line
        drawLine( [selX1, selY2] , [selX2, selY2] , width );
        // Draw Edge Marks
        drawLine([selX1, selY2 - halfMark], [selX1, selY2 + halfMark],width);
        drawLine([selX2, selY2 - halfMark], [selX2, selY2 + halfMark],width);

        // Draw main left line
        selX1 = selX1 - 10;
        drawLine([selX1, selY1], [selX1, selY2], width );
        // Draw Edge Marks
        drawLine([selX1 - halfMark, selY1], [selX1 + halfMark, selY1],width);
        drawLine([selX1 - halfMark, selY2], [selX1 + halfMark, selY2],width);

         var nameArray = doc.name.split ("-");
         var dimensionArray = nameArray[1].split("x");
        // Set some values for text layer
        label = dimensionArray[0]+" "+nameArray[2] ;    //'Width';
        var rotateme = false;
        val = selWidth + 1;
        txtLayerPos = [selX1 + val / 2, (selY2 - txtMargin)+40];
        txtJ11n = Justification.CENTER;
        dimensionText(txtLayerPos,txtJ11n,label,rotateme);
        /////////////////////////////////////////////////////////////////////////////////
        // Set some values for text layer
        label = dimensionArray[2] +" "+nameArray[2]; //'Height';
        rotateme = true;
        val = selHeight + 1;
        txtLayerPos = [(selX1 + txtMargin) - 80, selY1 + val / 2 + 4];
        txtJ11n = Justification.LEFT;
        dimensionText(txtLayerPos,txtJ11n,label,rotateme);
    }

    function dimensionText(txtLayerPos,txtJ11n,label,rotateme)
    {
        
        app.preferences.rulerUnits = Units.INCHES;
        var fontsize = parseInt (doc.height);
        app.preferences.rulerUnits = Units.PIXELS;        
        
        var mainLayerSet = doc.layerSets.add();
        mainLayerSet.name = "Pixel Measures";
        mainLayerSet = doc.layerSets.getByName ("Pixel Measures");
        var layerSetRef = mainLayerSet.layerSets.add() ;
        var textLayerRef = layerSetRef.artLayers.add();
        textLayerRef.kind = LayerKind.TEXT;
        var textItemRef = textLayerRef.textItem;
        
        textItemRef.contents =   label;
        textItemRef.justification = txtJ11n;
        textItemRef.position = txtLayerPos;
        layerSetRef.name = textItemRef.contents;
        textItemRef.color = app.foregroundColor;
        textItemRef.font = "ArialMT";
        textItemRef.size = new UnitValue(fontsize,  "px");
        textItemRef.autoKerning = AutoKernType.OPTICAL;
        // Finish
        textLayerRef.rasterize (RasterizeType.TEXTCONTENTS);
        mainLayerSet.move( doc.artLayers.add(), ElementPlacement.PLACEBEFORE);
        var finalLayer = mainLayerSet.merge();
        finalLayer.name = label;
        if(rotateme){
            finalLayer.rotate ("270");
        }
    }

    function setScaleF(ratio) 
    {
        return function (value) {
            return value / ratio;
        }
    }
    
    function drawLine( startXY, endXY, width )
    {  
        var desc = new ActionDescriptor();  
        var lineDesc = new ActionDescriptor();  
        var startDesc = new ActionDescriptor();  
        startDesc.putUnitDouble( charIDToTypeID('Hrzn'), charIDToTypeID('#Pxl'), startXY[0] );  
        startDesc.putUnitDouble( charIDToTypeID('Vrtc'), charIDToTypeID('#Pxl'), startXY[1] );  
        lineDesc.putObject( charIDToTypeID('Strt'), charIDToTypeID('Pnt '), startDesc );  
        var endDesc = new ActionDescriptor();  
        endDesc.putUnitDouble( charIDToTypeID('Hrzn'), charIDToTypeID('#Pxl'), endXY[0] );  
        endDesc.putUnitDouble( charIDToTypeID('Vrtc'), charIDToTypeID('#Pxl'), endXY[1] );  
        lineDesc.putObject( charIDToTypeID('End '), charIDToTypeID('Pnt '), endDesc );  
        lineDesc.putUnitDouble( charIDToTypeID('Wdth'), charIDToTypeID('#Pxl'), width );  
        desc.putObject( charIDToTypeID('Shp '), charIDToTypeID('Ln  '), lineDesc );  
        desc.putBoolean( charIDToTypeID('AntA'), true );  
        executeAction( charIDToTypeID('Draw'), desc, DialogModes.NO );  
    }    

    function magicWand(x,y,t,a,c,s)
    {  
        if(arguments.length < 2) return;// make sure have x,y  
        if(undefined == t) var t = 32;// set defaults of optional arguments  
        if(undefined == a) var a = true;  
        if(undefined == c) var c = false;  
        if(undefined == s) var s = false;  
        var desc = new ActionDescriptor();  
        var ref = new ActionReference();  
        ref.putProperty( charIDToTypeID('Chnl'), charIDToTypeID('fsel') );  
        desc.putReference( charIDToTypeID('null'), ref );  
        var positionDesc = new ActionDescriptor();  
        positionDesc.putUnitDouble( charIDToTypeID('Hrzn'), charIDToTypeID('#Rlt'), x );// in pixels  
        positionDesc.putUnitDouble( charIDToTypeID('Vrtc'), charIDToTypeID('#Rlt'), y );  
        desc.putObject( charIDToTypeID('T   '), charIDToTypeID('Pnt '), positionDesc );  
        desc.putInteger( charIDToTypeID('Tlrn'), t);// tolerance  
        desc.putBoolean( charIDToTypeID('Mrgd'), s );// sample all layers  
        if(!c) desc.putBoolean( charIDToTypeID( "Cntg" ), false );//  contiguous  
        desc.putBoolean( charIDToTypeID('AntA'), a );// anti-alias  
        executeAction( charIDToTypeID('setd'), desc, DialogModes.NO );  
    }  
