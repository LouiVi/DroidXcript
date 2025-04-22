//
// DroidScript Main Application
//
// Copyright: droidscript.org
// Author: david@droidscript.org
//
// (Note: This source code is provided unobfuscated and commented in
// the hope that it is useful for educational purposes. It remains the
// copyright of droidscript.org)
//

//General globals.
var language = "English";
var layBack,layFront,layRight,layLeft,layEdit;
var layChatTab,layTermTab;
var scrollIcons,dlgShop,txtRemote,lstSamp,webDocs;
var textSize=12, timer=0, lastLine=0;
var textChanged=false, lastProg="";
var tipCount=0, sharedApp=null; tmrAds=0;
var g_debugParams="", dirty=false;
var isWebIDE=false; imgGrad = null;
var ignoreIcons=false, isSample = false;
var sharedFiles, sharedText, startedByShare;
var plgApk=null, playStore=null, purchases=[];
var pluginVersions=[], crypt=null;
var g_tester=false, g_sdk=true, g_aab=false;
var tablet=false, lowRes=false, orient="Portrait";
var isHtml=false,isBlocks=false,isPython=false;
var isIO = false; var isEspruino = false;
var useADB = false; var premium = premiumPlus = false;
var net=null, port=19800, udpTimer=0;
var usePass = false, password="",deviceName="",cloudKey="";
var curProgram = null, lstDlgCopy=null, lastProgs=null;
var useSoftKeys=true, useYoyo=true, stayAwake=true, autoHelp=true;
var headless=false,useAce=false,txtDebug=null,forceOrient="",noGUI=false;
var useDarkTheme=true, usingAce=false, allowBackRun=false;
var lastCursorPos = [], curProgTitle=null;
var espruino=null, term=null, webAce=null;
var permissions = "", plugins = "", options = "";
var updatesChecked = false;
var node = null, remotes = []
var v3 = false, editMenus = []
var appReady = false

//Template apps.
var templates = {
	Native:"Simple,Game,Background Job ◆,Background Service ◆,Web Server ◆,Multi-page ◆",
	Node:"Simple ◆,Node Server ◆",
	HTML:"Simple",
	Hybrid:"Simple ◆,AppBar and Drawer ◆,Web App ◆",
	Python:"Simple,Hybrid"
}

_isIDE = true       //Flag that we are the IDE.
_isGPlay = false     //Is this the Google Play version.

//Called when application is started.
function OnStart()
{
    //_Boost( true )
	app.SetDebug("console")
	app.ShowProgress("")

	//Detect OS/hardware.
	model = app.GetModel()
	osVer = app.GetOSVersion()
	isChrome = app.IsChrome()
	isTV = app.IsTV()

    //Check for fixed premium.
    if( app.IsEngine() ) { premium = premiumPlus = true }

	//Detect OS type (and switch to chrome mode if required).
	var product = app.SysExec("getprop ro.build.product").toLowerCase();
	isRemix = (product.indexOf("remix")>-1 || product.indexOf("nexbox")>-1 || product.indexOf("vim")>-1 );
	if( isRemix ) isChrome = true;

    //Disable normal back key functionality
    app.EnableBackKey( false );

	//Set appropriate default text size and screen.
	dens = app.GetScreenDensity();
	var defTextSize = 12;
	if( app.IsTablet() && dens < 200 ) defTextSize = 13;

	//Check for screen reader.
	var acc = app.GetAccessibility();

	//Load settings.
	headless = (isChrome || isRemix || isTV);
	textSize = app.LoadNumber( "TextSize", defTextSize );
	useADB = app.LoadBoolean( "UseADB" );
	useSoftKeys = app.LoadBoolean( "UseSoftKeys", headless?false:true );
	useYoyo = app.LoadBoolean( "UseYoyo", headless?false:true );
	noIcons = app.LoadBoolean( "NoIcons", acc.screenReader && acc.exploreByTouch );
	autoHelp = app.LoadBoolean( "AutoHelp", true );
	stayAwake = app.LoadBoolean( "StayAwake", true );
	allowBackRun = app.LoadBoolean( "AllowBackRun", false );
	useDarkTheme = app.LoadBoolean( "UseDarkTheme", true );
	experiments = app.LoadBoolean( "Experiments", false );
	usePass = app.LoadBoolean( "UsePass", headless?false:false );
	password = app.LoadText( "Password", Math.random().toString(36).substr(4,4) );
	deviceName = app.LoadText( "DeviceName", app.GetModel() );
	language = app.LoadText( "Language", "English" );
	autoBoot = app.LoadText( "_AutoBoot", "false", "spremote" );
	autoWifi = app.LoadBoolean( "_AutoWifi", false, "spremote" );
	autoStart = app.LoadText( "_AutoStart", null, "spremote" );
	wifiSSID = app.LoadText( "WifiSSID", null );
	wifiKey = app.LoadText( "WifiKey", null );
	personalAccessToken = app.LoadText( "PersonalAccessToken", "" )
	cloudKey = app.LoadText( "CloudKey", "" )
	curProgram = app.LoadText( "_LastApp", "Hello World" )
	storeUrl = app.LoadText( "StoreUrl", "https://ds.justplayer.de/droidscript/demos" );

	//Get app name and path and detect first/fresh install.
	appName = app.GetName();
	appPath = "/storage/emulated/0/" + appName;
	isFreshInstall = !app.FolderExists( appPath )

/*
	//Extract config file if in IOT mode.
	var configFile = "/storage/emulated/0/DroidScript/config.json";
	if( app.FileExists("/assets/sdcard/config.json") ) {
		if( !app.FileExists(configFile) ) app.ExtractAssets( "sdcard", appPath, true );
		isIO = true;
	}
	//Override settings with config file if found.
	try {
		if( app.FileExists( configFile ) )
		{
			var conFile = app.ReadFile( configFile );
			var config = JSON.parse( conFile );
			if( config.useADB!=null ) useADB = config.useADB;
			if( config.useSoftKeys!=null ) useSoftKeys = config.useSoftKeys;
			if( config.useYoyo!=null ) useYoyo = config.useYoyo;
			if( config.autoHelp!=null ) autoHelp = config.autoHelp;
			if( config.useDarkTheme!=null ) useDarkTheme = config.useDarkTheme;
			if( config.allowBackRun!=null ) allowBackRun = config.allowBackRun;
			if( config.stayAwake!=null ) stayAwake = config.stayAwake;
			if( config.usePass!=null ) usePass = config.usePass;
			if( config.password!=null ) password = config.password;
			if( config.deviceName!=null ) deviceName = config.deviceName;
			if( config.language!=null ) language = config.language;
			if( config.autoBoot!=null ) autoBoot = config.autoBoot;
			if( config.autoWifi!=null ) autoWifi = config.autoWifi;
			if( config.autoStart!=null ) autoStart = config.autoStart;
			if( config.wifiSSID!=null ) wifiSSID = config.wifiSSID;
			if( config.wifiKey!=null ) wifiKey = config.wifiKey;
			if( config.useAce!=null ) { useAce = config.useAce; if(useAce) headless=true; }
			if( config.useChrome!=null ) { isChrome = config.useChrome; if(isChrome) headless=true; }
			if( config.orientation!=null ) forceOrient = config.orientation;
			if( config.noGUI!=null ) { noGUI = config.noGUI; if(noGUI) headless=true; }
			if( config.noHeadless!=null ) { noHeadless = config.noHeadless; if(noHeadless) headless=isTV=false; }
			if( config.experiments!=null ) experiments = config.experiments;
			if( config.personalAccessToken!=null ) personalAccessToken = config.personalAccessToken;
			if( config.cloudKey!=null ) cloudKey = config.cloudKey;
		}
	}
	catch(e){}
	*/

	//Force DS-IO to be headless.
	if( !app.FolderExists( "/assets/ide" ) ) headless = true;

	//Set T() translation language.
	app.SetAppLanguage( language );

	//Save passwords and device name for IDE web server use.
	app.SaveBoolean( "UsePass", usePass );
	app.SaveText( "Password", password );
	app.SaveText( "DeviceName", deviceName );
	app.SaveText( "CloudKey", cloudKey );

    //Extract all internal assets,plugins,extensions,docs and tidy up.
    ExtractInternals();
    TidyUp();

	//Keep screen awake if required.
	if( stayAwake ) app.PreventScreenLock( "Full" );

	//Connect network if a specific ssid is set.
	if( wifiSSID ) app.WifiConnect( wifiSSID, wifiKey );

	//Lock screen orientation to Portrait at startup (if phone app).
	startOrient = app.GetOrientation();
	if( headless || forceOrient.toLowerCase()=="landscape" ) OnRotate();
	else app.SetOrientation( "Portrait", OnRotate );
}

 //Extract all internal assets,plugins,extensions,docs etc
 function ExtractInternals( force, msg )
 {
	//Extract samples Wifi IDE and system plugin docs.
	var editDir = appPath+"/.edit";
	if( app.IsNewVersion() || !app.FolderExists(editDir) || force )
	{
	    app.ShowProgressBar( msg ? msg : "Extracting resources, please be patient...", 0, isChrome?"light":"" );
	    app.Wait( 1, true ) //Allow time for progress dialog to show.
		//app.ExtractAssets( "sdcard/"+app.GetAppLangCode(), appPath, true );
		if( isFreshInstall ) app.ExtractAssets( "sdcard/en", appPath, true );
		app.UpdateProgressBar( 10, "doevents" );
		app.ExtractAssets( "edit", editDir, true );
		app.UpdateProgressBar( 30, "doevents" );
		app.ExtractAssets( "plugs", editDir+"/docs", true );
		//app.ExtractAssets( "UI", editDir+"/UI", true );
		app.UpdateProgressBar( 40, "doevents" );
	}

	//Extract .node folder (on new version or re-install)
	if( app.IsNewVersion() || !app.FolderExists(appPath+"/.node") || force ) {
	    app.ExtractAssets( "sdcard/node", appPath+"/.node", true );
	    app.DeleteFolder( app.GetPrivateFolder("node")  );
	    app.UpdateProgressBar( 50, "doevents" );
	}

	//Extract built-in plugins (on new version or re-install)
	if( app.IsNewVersion() || !app.FolderExists(appPath+"/Plugins") || force ) {
	    app.ExtractAssets( "sdcard/Plugins", appPath+"/Plugins", true );
	    app.UpdateProgressBar( 60, "doevents" );
	}

	//Extract built-in extensions (on new version or re-install)
	if( app.IsNewVersion() || !app.FolderExists(appPath+"/Extensions") || force ) {
	    app.ExtractAssets( "sdcard/Extensions", appPath+"/Extensions", true );
	    app.DeleteFolder( appPath+"/Extensions/Terminal" )
	    app.DeleteFolder( appPath+"/Extensions/Chat" )
	    app.UpdateProgressBar( 70, "doevents" );
	}

	app.UpdateProgressBar( 80, "doevents" );
}

//Delete temp files etc.
function TidyUp()
{
	//Delete demo and temp folders.
	app.DeleteFolder( appPath+"/.demo" );
	tempFldr = "/storage/emulated/0/.DroidScript/Temp";
	app.DeleteFolder( tempFldr );
	app.MakeFolder( tempFldr );
	app.DeleteFolder( app.GetPrivateFolder("temp") );
}

//Remove and re-extract all internal resources.
function Clean( msg )
{
    msg = msg?msg:"Cleaning..."
    _Dbg( msg )
    app.DeleteFolder( appPath+"/.edit" );
    app.DeleteFolder( appPath+"/.node" );
    ExtractInternals( true, msg );
    TidyUp();
    ImportUserPlugins( true );
    ExtractMissingPluginDocs();
    app.HideProgressBar();
    _Dbg( "Done!" );
}

//Reset app to fresh install state (but keep projects).
function Reset( option )
{
    app.DeleteFolder( app.GetPrivateFolder( "Plugins" ) );
    app.DeleteFolder( appPath+"/Extensions" );
    if( option=="full" ) app.ClearData();
    Clean( "Resetting..." );
}

//Delete given internal DS folder/file (except main project folder).
function Delete( option )
{
    if( !option.toLowerCase().endsWith("/droidscript") && !option.endsWith("/") ) {
        _Dbg( "Deleting: " + option )
        app.DeleteFolder( option )
    }
}

//Show info about given ds path/item.
function Show( option )
{
    if( option.startsWith("/") ) {
        _Dbg( app.RealPath(option) )
    }
}

//Called when forced rotation is complete.
function OnRotate()
{
	orient = app.GetOrientation();
	isPortrait = (orient=="Portrait");
	console.log( orient );

	//Get screen dimensions.
	sw = app.GetScreenWidth();
	sh = app.GetScreenHeight();
	tablet = app.IsTablet(); //( (sw > 1200 || sh > 1200) && dens < 320 );
	lowRes = ( sw < 800 && sh < 800 );

	//Get display dimensions and aspect ratio
	dw = app.GetDisplayWidth();
	dh = app.GetDisplayHeight();
	aspect = dw / dh;
	console.log( aspect );

	//Set theme.
	CreateTheme();

	//Set menus.
	menus = "New:Add.png,Connect:Connect.png,Exit:Exit.png";
	SetMenus( menus, "/assets/Img" );

	//Register for error broadcasts.
	app.SetOnBroadcast( app_OnBroadcast );

	//Check for test mode and SDK mode.
	if( app.FileExists( "/storage/emulated/0/DroidScript/_beta_") ) g_tester = true;
	//if( app.FileExists( "/sdcard/DroidScript/_sdk_") ) g_sdk = true;
	if( osVer > 28 ) g_sdk = false;

	//Set or unlock orientation.
	if( model.indexOf("ODROID") > -1 || forceOrient.toLowerCase()=="landscape" || headless )
	{
		if( !isTV ) setTimeout( function(){app.SetOrientation( "Landscape" )},100 );
		else app.SetOrientation( "Landscape" );
	}
	else setTimeout( function(){app.SetOrientation("")},100 );

	//Create the main graphical layout.
	if( !noGUI && (isRemix || isChrome || useAce) ) CreateAceLayout();
	else if( isTV ) CreateTvLayout()
	else if( headless ) CreateHeadlessLayout( true );
	else CreateLayout();

	//Detect keyboard showing and set focus to editor.
	app.SetOnShowKeyboard( app_OnShowKeyBoard );

	//Check for plugin licenses and handle plugins.
	CheckLicenses();
	ConvertApkPlugins();
	ImportUserPlugins();
	ExtractMissingPluginDocs();
	ListPlugins();
	ListExtensions();

	//Check for auto wifi or chrome connect.
	if( autoWifi || headless )
	    setTimeout( Connect, 2000 );
	else {
	    setTimeout( ()=> {
            app.StartDebugServer("local");
            StartFileServer();
	    }, 2000 );
	}

	//Get samples list for chrome etc.
	if( headless ) setTimeout( GetSamples, 3000 );

	//Check for updates if not done (usually done after license check)
	if( !isTV ) setTimeout( function(){ if(!updatesChecked) CheckForUpdates()}, 5000 )

    app.HideProgressBar();
	app.HideProgress();

	//Check for auto-start app.
	if( autoStart && autoStart!="null" && autoStart!="false" ) {
		LaunchApp( autoStart, "", "debug,remote" );
		//setInterval( function(){app.ToBack()}, 3000 )
	}

	//Enable DS auto-boot if required.
	app.SetAutoBoot( autoBoot );

    //Show the user's app list.
    ShowIcons(true)

	//Create ongoing notification to keep DS alive when in background.
	//(Does not work)
	//notifyDS = app.CreateNotification( "Ongoing,IDE,NoVibrate" )
	//notifyDS.SetMessage( "DroidScript", "DroidScript IDE", "Running" )
	//notifyDS.Notify( "DroidScript" )

	appReady = true
}

//Called when shared data is received.
function OnData( isStartUp )
{
	//Check for any shared files from other apps
	//and pass on to user's programs.
	sharedFiles = app.GetSharedFiles();
	sharedText = app.GetSharedText();
	sharedIntent = app.GetIntent();
	app.SaveText( "_SharedFiles", sharedFiles, "spremote" );
	app.SaveText( "_SharedText", sharedText, "spremote" );

	//Handle spk/ppk/epk/zip files.
	if( sharedFiles && sharedFiles[0] ) {
		for(var i in sharedFiles)
			if(sharedFiles[i].match(/\.(spk|ppk|epk|zip)$/))
				setTimeout( ()=>{DownloadSPK(sharedFiles[i])}, 1000 )
	}
	//Check if we need to auto-launch user app.
	else if( sharedFiles || sharedText /*|| sharedIntent*/ )
	{
		sharedApp = app.LoadText( "_SharedApp", null, "spremote" );
		if( sharedApp )
		{
			startedByShare = isStartUp;
			LaunchApp( sharedApp, sharedFiles || sharedText ? "" : JSON.stringify(sharedIntent) );
		}
	}
	else
	{
	    //Get intent data.
	    var data = app.GetIntent().data

    	//Check for Chat Oauth result.
    	if( data.startsWith("ds-ide://oauth"))
    	{
            data = data.slice(data.indexOf("data=") + 5)
            data = decodeURIComponent(atob(data))
            //webChat.Execute( `OnLoginSuccess(${data})` )
    	}
	}
}

//Called when back button is pressed.
function OnBack()
{
	if( headless ) { app.ToBack(); return; }

	if( txtRemote.IsVisible() ) {
		txtRemote_OnTouchDown();
		return;
	}
	if( layMenu.IsVisible() ) {
		btnMenu_OnTouch();
	}
	else if( app.IsDebugVisible() ) {
	    app.ShowDebug( false )
	}
	else if( layLeft.IsVisible()  ) {
		if( app.GetData("CurWebDoc")=="Documentation" ) btnLeft_OnTouch();
		else webDocs.Execute( "history.back();" );
	}
	else if( layRight.IsVisible() )
	{
		//if( !v3 && layEditSamp.IsVisible() )
		//    layEditSamp.Hide();
		//else
		if( layChatTab.IsVisible() ) {
            if( webChat.GetUrl()!=webChat.GetHomeUrl() ) webChat.Back();
            else btnRight_OnTouch();
		}
		else btnRight_OnTouch();
		HideCodingMenus();
	}
	else if( layFile.IsVisible() )
	{
		btnFiles_OnTouch();
		edit.Focus();
	}
	else if( laySrch.IsVisible() || layCC.IsVisible() )
	{
		HideCodingMenus( true );
		edit.Focus();
	}
	else if( layEdit.IsVisible() )	{
	    CloseEditor()
	}
	else {
	//if( !sharedFiles && !sharedText ) {
		var yesNo = app.CreateYesNoDialog( T("ExitDroidScript") );
		yesNo.SetOnTouch( yesNoExit_OnTouch );
		yesNo.Show();
	//}
	}
}

//Close the code editor.
function CloseEditor()
{
    //Save user's changes and hide menus.
    SaveFile();
    btnFiles.Hide();
    layFile.Hide();
    HideCodingMenus();
    LoadMenus();
    if( layCopy.IsVisible() ) edit_OnDoubleTap();

    //Animate flip and stop timer.
    layFlip.Animate( "Flip", null, 350 );
    clearTimeout( timer );
}

//Called when application is paused.
function OnPause()
{
}

//Called when application is resumed.
function OnResume()
{
	if( sharedApp && startedByShare ) { /*notifyDS.Cancel();*/ app.Exit() }
}

//Handle Exit app choice.
function yesNoExit_OnTouch( result )
{
	if( result=="Yes" ) { /*notifyDS.Cancel();*/ app.Exit() }
}

//Set current language.
function SetLanguage( changed )
{
	//Reset T() translation language.
	app.SetAppLanguage( language );

	//Get docs path.
	var code = "-" + app.GetAppLangCode( language );
	if( code=="-en" ) code = "";
	docsPath = appPath + "/.edit/docs" + code;
	if( true ) webDocs.LoadUrl( "file://" + docsPath + "/Docs.htm?ds=true" );

	//Load sample list.
	//if( !v3 ) lstSamp.SetList( GetSamples(), "\\|" );

	//Load menus.
	LoadMenus();

	//Re-Extract the 'Hello World' sample if language changed.
	//if( changed ) app.ExtractAssets( "sdcard/"+app.GetAppLangCode(), appPath, true );

	//Save language code (use by ide server).
	app.SaveText( "LanguageCode", app.GetAppLangCode() );
}

//Handle spk installs.
function installDiag_OnTouch( result )
{
	if( result=="Yes" ) CheckPackage( spkFile );
	else app.ShowPopup( "Package rejected" );
}

//Set spacing of title and margins.
function SetTitleMargins()
{
	var left,right,top,bottom,width,height;

	//Set title bar size.
	layBar.SetSize( -1, topBarHeight );
	layBar.SetPadding( 0,0.004,0,0 )

	//Set title image size and margins.
	if( orient=="Portrait" ) {
		width = (tablet?0.3:0.3); height = (tablet?0.036:0.051);
		//left = (tablet?0.28:0.21);  right = (tablet?0.28:0.21);
		//top = (lowRes?0.018:(tablet?0.012:0.014));  bottom = (lowRes?0.018:(tablet?0.012:0.014));
		if( tablet ) scale=0.63; else scale=0.24;
	}
	else {
		width = (tablet?0.24:0.24); height = (tablet?0.065:0.100);
		//left = (tablet?0.46:0.340);  right = (tablet?0.46:0.340);
		//top = (lowRes?0.028:(tablet?0.022:0.025));  bottom = (lowRes?0.028:(tablet?0.022:0.025));
		if( tablet ) scale=0.53; else scale=0.72;
	}
	//imgTitle.SetSize( width, height );
	//imgTitle.SetMargins( left*scale,top,right*scale,bottom );
	btnFiles.SetSize( width, height );  //Note: Test these margins on multiple tablets!!
	if( orient=="Portrait" )
		btnFiles.SetMargins( tablet?(aspect>0.67?0.14:0.17):8,0,tablet?0.14:8,0,tablet?"":"dip" );
	else btnFiles.SetMargins( tablet?(aspect>0.67?0.26:0.28):0.2, 0, tablet?0.26:0.2, 0 );

	//Set title button sizes.
	//if( orient=="Portrait" ) { width = (tablet?54:54);  height = (tablet?50:50);  }
	//else { width = (tablet?54:54);  height = (tablet?50:50);  }
	width = orient=="Portrait" ? 0.16 : 0.07
	height = orient=="Portrait" ? 0.074 : 0.14
	btnLeft.SetSize( width, height);
	btnConnect.SetSize( width, height );
	btnFiles.SetSize( -1, height );
	btnRight.SetSize( width, height );
	btnMenu.SetSize( width, height );
}

//Re-set spacings and sizes of controls.
function AdjustLayout()
{
	var left,right,top,bottom,width,height;

	//Set samples and docs top padding (so we can see title bar).
   // if( orient=="Portrait" ) top = (lowRes?0.104:(tablet?0.066:0.080));
	//else top =topBarHeight
	layRight.SetPadding( 0, topBarHeight, 0, 0 );
	layLeft.SetPadding( 0, topBarHeight, 0, 0 );

	//Reset programs list and gradient cover layer size.
	width = 1.0; height = 0.94;
	//lst.SetSize( width, height );
	//lst.SetPadding( (tablet?0.2:0.12), 0.01, (tablet?0.2:0.12), 0.01 );
	//imgGrad.SetSize( width, height );
	//ads.Resize()

	//Reset code editor dimensions.
	if( orient=="Portrait" ) height = (lowRes?0.83:(tablet?0.88:0.858));
	else height = (lowRes?0.83:(tablet?0.81:0.79));
	//xx scrollEdit.SetSize( 1.0, height );
	//xx if( orient=="Portrait" ) edit.SetSize( 1.5, -1 );
	//xx else edit.SetSize( 1.0, -1 );
	//edit.SetSize( 1.0, height );

	var barh = (orient=="Portrait"? bottomBarHeight : bottomBarHeight );
	edit.SetSize( 1.0, 1-topBarHeight-barh );
	layEditBtns.SetSize( 1.0, bottomBarHeight);

	//Set code editor button height.
	if( orient=="Portrait" ) height = (tablet?0.04:0.052);
	else height = (tablet?0.06:0.088);
	var width = 0.155;
	btnUndo.SetSize( width, height );
	btnRedo.SetSize( width, height );
	btnNew.SetSize( width, height );
	btnAsset.SetSize( width, height );
	btnDbg.SetSize( width, height );
	btnExec.SetSize( width, height );

    //Set samples/editor height.
    if( orient=="Portrait" ) height = (lowRes?0.83:(tablet?0.88:0.86));
    else height = (lowRes?0.83:(tablet?0.81:0.82));

    if( false ) {
        //Set sample editor button height.
        if( orient=="Portrait" ) btnHeight = (tablet?0.044:0.052);
        else btnHeight = (tablet?0.066:0.088);

        //Reset sample editor + button dimensions.
        editSamp.SetSize( 1.0, height-btnHeight-0.04 );
        btnCopy.SetSize( 0.26, btnHeight );
        btnRun.SetSize( 0.26, btnHeight );
	}
	else {
	    //webSamples.SetSize( 1.0, height );
	}

	//Set menu position.
	if( orient=="Portrait" ) layMenu.SetPosition( tablet?0.6:0.5, topBarHeight );
	else layMenu.SetPosition( 0.72, topBarHeight );

	//Set file list position.
	layFile.SetPosition( isPortrait?0.3:0.385, topBarHeight );
}

//Called when configuration changes.
function OnConfig()
{
	if( headless ) return;

    app.Hide()
	//try
	{
		//Resize terminal if visible.
		if( term ) term.Resize();

		//Get new orientation.
		orient = app.GetOrientation();
		isPortrait = (orient=="Portrait");

		//Calculate scaling val to keep objects same size.
		dw = app.GetDisplayWidth();
		dh = app.GetDisplayHeight();
		aspect = dw / dh;
		console.log( aspect );

		//Re-position controls.
		PrepareCodingMenus();
		SetTitleMargins();
		AdjustLayout();

		ResizeCodingMenus();

		//less than 1000ms can cause issues when starting up in reverse-portrait mode.
		ShowIcons(true)
		//setTimeout( function(){ShowIcons(true)}, 10000 );
		ignoreIcons = false;
	}
	//catch(e) {}
	app.Show()
}

//Handle wifi connect button.
function btnConnect_OnTouch()
{
	HandleMenu( "Connect" );
}

//Load the main menus.
function LoadMenus( edit )
{
    if( !edit ) {
        var sdk = (g_sdk ? ",SDK": "" );
        lstMenu.SetList( T("New")+","+T("Plugins")+","+T("Settings")+",Backup,"+T("Premium")+sdk+","+T("About") );
	}
	else {
	    //Set context sensitive menus.
	    lstMenu.SetList( T("Plugins")+","+T("Settings")+",Command"+(editMenus.length?","+editMenus:"") );
	}
}

//Set menus.
function SetMenus( list, images )
{
	//Do nothing.
	//app.SetMenu( list );
}

//Handle custom menu.
function lstMenu_OnTouch( item )
{
	btnMenu_OnTouch();
	HandleMenu( item );
}

//Called when user selects a menu item.
function OnMenu( name )
{
	if( name==null ) btnMenu_OnTouch();
	//HandleMenu( name );
}

//Start wifi edit server.
function Connect( prompt )
{
	if( useADB ) {
		if( prompt ) app.Alert( T("UseADB"), "ADB Connect" );
	}
	else {
		if( /*!app.IsConnected()*/ app.GetIPAddress().startsWith("0.0.0.0") ) {  //<-- can use ADB
	    	if( prompt ) { app.ShowPopup( T("ActivateWifi") ); return; }
		}
		if( prompt ) app.Alert( T("UseWifi") + app.GetIPAddress()+":8088\n\n" +
			(usePass?T("Password")+": "+password :""), T("WifiConnect"), "" );
	}

    app.PreventWifiSleep();
    //app.StopDebugServer();
	app.StartDebugServer();
	if( !headless ) btnConnect.SetTextColor("#41DB84");

	//Allow discovery via UDP.
	if( app.IsAPK() )
	{
		if( !net ) net = app.CreateNetClient( "UDP" );
		address = net.GetBroadcastAddress();
		SendDiscoveredMessage();
		clearInterval( udpTimer );
		udpTimer = setInterval( CheckForMsg, 1000 );
	}

	//Load IDE locally if using ace editor.
	if( usingAce ) webAce.LoadUrl("http:///127.0.0.1:8088")

	//Start browse server if premium (or embedded).
	StartFileServer()
}

//Broadcast our Datagram (UDP) packet.
function SendDiscoveredMessage()
{
	var jsonData = {};
	jsonData["appname"] = "DroidScript";
	jsonData["devicename"] = deviceName;
	jsonData["macaddress"] = app.GetMacAddress();
	jsonData["version"] = app.GetVersion();
	jsonData["usepass"] = usePass;

	net.SendDatagram( JSON.stringify(jsonData), "UTF-8", address, port );
}

//Called by our interval timer.
function CheckForMsg()
{
	//Try to read a packet for 1 millisec.
	var packet = net.ReceiveDatagram( "UTF-8", port, 1 );
	if( packet ) {
		if( packet.localeCompare("DISCOVER_DSSERVER_REQUEST") == 0 )
			SendDiscoveredMessage();
	}
}

//Called when user selects a menu item.
function HandleMenu( name )
{
	if( name==T("New") ) {
		if( premium )  {
		    templates.Native = templates.Native.replace(RegExp(" ◆","gim"), "")
		    templates.Node = templates.Node.replace(RegExp(" ◆","gim"), "")
		    templates.HTML = templates.HTML.replace(RegExp(" ◆","gim"), "")
		    templates.Hybrid = templates.Hybrid.replace(RegExp(" ◆","gim"), "")
		}
		ShowTextDialog( T("NewApp"), "", "Native,Node,HTML,Hybrid"+(true?",Python":""), "OnAdd", templates );
	}
	else if( name=="Connect" ) Connect( true );
	else if( name=="Exit" ) app.Exit( true );
	else if( name==T("About") ) ShowAbout();
	else if( name==T("Shop") ) ShowShop();
	else if( name==T("Settings") ) ShowSettings();
	else if( name==T("Plugins") ) ShowPlugins();
	else if( name==T("News") ) ShowNews();
	else if( name==T("Premium") ) ShowPremium();
	else if( name==T("Backup") ) { _LoadScriptSync("/Sys/ide/backup.js"); BackupProjects() }
	else if( name=="SDK" ) ShowSDKDialog();
	else if( name=="Command" ) {
    	ShowTextDialog( "IDE Command", "$logcat", null, "ext_Command" );
    }
	else {
	    //Handle context menu extensions.
	    var file = appPath+"/Extensions/"+name+"/Commander/Commands.js";
        if ( app.FileExists( file )) {
            _LoadScriptSync( file, true );
            ext_progId = "ext_"+curProgram.replaceAll(" ","_").toLowerCase()
            eval( name+"_OnMenu()" );
        }
	}
}

//Handle extension commands.
//(Compatible with wifi IDE extensions)
function ext_OnMessage( msg )
{
    var cmds = msg.split(":")[1].split("|")
    if( msg.startsWith("init:") ) {
        var premiumLevel = ( premium ? (premiumPlus?"+":"-") : "" )
		var msg = "init|127.0.0.1|"+curProgram+"|"+DW()+"|"+DH()+"||"+cloudKey+"|"+premiumLevel
        app.eventSource.Execute( 'ext.onMessage({data:"'+msg+'"})' )

    }
    else if( msg.startsWith("open:") ) {
        btnLeft_OnTouch();
        if( layEdit.IsVisible() ) SaveFile();
        LoadFile( curProgram, cmds[0] );
    }
}

//handle node run calls from extensions.
function ext_NodeRun( file, ctxId, extPaths ) {
    node.Run( file, ctxId, node_paths+":"+extPaths  )
}

//Handle node execute calls from extensions.
function ext_NodeExec( cmd, ctxId ) {
    node.Execute( cmd, ctxId )
}

//Handle IDE extension commands.
function ext_Command( cmd ) {
    app.ShowDebug( true, "dialog,clear" )
    OnIDE( "exec", cmd )
}

//Show custom slide out menu.
function btnMenu_OnTouch()
{
	if( headless && !usingAce ) return

	if( layMenu.GetVisibility()=="Hide" ) {
		if( !usingAce ) {
			HideCodingMenus();
			if( layFile.IsVisible()) layFile.Animate( "ScaleToTop" );
		}
		else webAce.Execute( "ds_blockUI(true)" );
		layMenu.Animate( "ScaleFromTop" );
	}
	else {
		layMenu.Animate( "ScaleToTop" );

		if( !usingAce )
		{
			//Show info bar and start code completion if editing.
			if( layEdit.GetVisibility()=="Show" ) {
				setTimeout( function(){layInfo.SetVisibility('Show')}, 250 );
				clearInterval( ccTimer );
				ccTimer = setInterval( CheckForCodeSuggestions, 500 );
			}
		}
		else webAce.Execute( "ds_blockUI(false)" );
	}
}

//Show slide out files menu.
function btnFiles_OnTouch()
{
	if( layFile.GetVisibility()=="Hide" ) {
		if( !usingAce ) {
			HideCodingMenus();
			if( layMenu.IsVisible() ) layMenu.Animate( "ScaleToTop" );
		}
		layFile.Animate( "ScaleFromTop" );
	}
	else {
		layFile.Animate( "ScaleToTop" );

		if( !usingAce )
		{
			//Show info bar and start code completion if editing.
			if( layEdit.GetVisibility()=="Show" ) {
				setTimeout( function(){layInfo.SetVisibility('Show')}, 250 );
				clearInterval( ccTimer );
				ccTimer = setInterval( CheckForCodeSuggestions, 500 );
			}
		}
	}
}

//Create the graphical layout.
function CreateLayout()
{
	//Remove old layouts if they exist.
	if( layBack ) app.RemoveLayout( layBack );
	if( layFront ) app.RemoveLayout( layFront );
	if( layRight ) app.RemoveLayout( layRight );
	if( layLeft ) app.RemoveLayout( layLeft );

	//Prepare popup editing and coding menus.
	PrepareCodingMenus();

	//--- Background screen -----
	layBack = app.CreateLayout( "linear", "vcenter,fillxy" );

	//Create text for remote connection message.
	txtRemote = app.CreateText( "Hello",-1,-1,"fontawesome,multiline" );
	txtRemote.SetTextSize( 22 );
	txtRemote.SetOnTouchDown( txtRemote_OnTouchDown );
	txtRemote.Gone();
	layBack.AddChild( txtRemote );

	//--- Main Screen ----------

	//Create main layout for buttons etc.
	layFront = app.CreateLayout( "linear", "vertical,fillxy,touchthrough" );

	//Create title bar and buttons.
	layBar = app.CreateLayout( "Linear", "horizontal,vcenter,fillx" );
	layBar.SetBackColor( "#2E3134" );
	layBar.SetSize( -1, topBarHeight );
	btnLeft = app.CreateButton( noIcons?"Left Drawer":">>", (tablet?0.16:0.23),
			(tablet?0.038:0.04), "fontawesome" );
	btnLeft.SetOnTouch( btnLeft_OnTouch );
	btnLeft.SetTextSize( noIcons?"9":"16", "dip");
	btnLeft.SetTextColor("#dddddd");
	layBar.AddChild( btnLeft );

	btnConnect = app.CreateButton( noIcons?"Wifi":"[fa-wifi]", (tablet?0.2:0.27),
			(tablet?0.042:0.08), "fontawesome" );
	//btnConnect.SetSize( (tablet?0.08:0.13), (tablet?0.040:0.056) );
	btnConnect.SetOnTouch( btnConnect_OnTouch );
	//btnConnect.SetMargins(0.01,0,0,0);
	btnConnect.SetTextSize( noIcons?"9":"16", "dip");
	btnConnect.SetTextColor("#999999");
	//btnConnect.SetPadding(0,0,0,4,"dip");
	layBar.AddChild( btnConnect );

	btnFiles = app.CreateButton( "", (tablet?0.08:0.13), (tablet?0.040:0.055), "singleline,autoshrink" );
	//btnFiles.SetSize( (tablet?0.16:0.26), (tablet?0.040:0.056) );
	btnFiles.SetOnTouch( btnFiles_OnTouch );
	btnFiles.SetMargins(0.04,0,0.04,0);
	btnFiles.SetTextSize( lowRes?12:14, "dip");
	btnFiles.SetTextColor("#dddddd");
	btnFiles.SetEllipsize( "end" );
	//btnFiles.SetPadding(0,0,0,0.014);
	btnFiles.Hide();
	layBar.AddChild( btnFiles );

	btnMenu = app.CreateButton( noIcons?"...":"[fa-ellipsis-v]", (tablet?0.08:0.13),
			(tablet?0.040:0.055), "fontawesome" );
	//btnMenu.SetSize( (tablet?0.08:0.13), (tablet?0.040:0.056) );
	btnMenu.SetOnTouch( btnMenu_OnTouch );
	//btnMenu.SetMargins(0,0,0.01,0);
	btnMenu.SetTextSize( "14", "dip");
	btnMenu.SetTextColor("#dddddd");
	//btnMenu.SetPadding(0,0,0,0.014);
	layBar.AddChild( btnMenu );

	btnRight = app.CreateButton( noIcons?"Right Drawer":"<<", (tablet?0.16:0.23),
			(tablet?0.038:0.04), "fontawesome,SingleLine,AutoScale" );
	btnRight.SetOnTouch( btnRight_OnTouch );
	btnRight.SetTextSize( noIcons?"9":"16", "dip");
	btnRight.SetTextColor("#ffffff");
	layBar.AddChild( btnRight );
	layFront.AddChild( layBar );
	SetTitleMargins();

	//Create layout to allow flipping of list/code.
	layFlip = app.CreateLayout( "Frame", "" );

	//Create TextEdit control to edit code (invisible at first).
	layEdit = app.CreateLayout( "Linear", "Vertical,FillXY" );
	layEdit.SetVisibility( "Hide" );
	edit = app.CreateCodeEdit( "", 1.0, (lowRes?0.83:(tablet?0.88:0.86)), "" );
	if( useDarkTheme ) edit.SetColorScheme( "Dark" )
	edit.SetTextSize( textSize );
	edit.SetPadding( 0.02,0,0,0 );
	edit.SetOnChange( edit_OnChange );
	edit.SetOnKey( edit_OnKey );
	edit.SetOnDoubleTap( edit_OnDoubleTap );
	edit.SetUseKeyboard( useSoftKeys );
	edit.SetNavigationMethod( useYoyo ? "Yoyo" : "Touch" );
	layEdit.AddChild( edit );

	//Create editing buttons.
	layEditBtns = app.CreateLayout( "Linear", "Horizontal,VCenter,FillX" );
	//layEditBtns.SetPadding( 0,0.006,0,0.006 );
	layEditBtns.SetBackColor( "#26282A" );
	layEditBtns.SetSize( 1.0, bottomBarHeight);

	btnUndo = app.CreateButton( noIcons?"Undo":"[fa-undo]", 0.14, (tablet?0.04:0.06), "fontawesome" );
	btnUndo.SetOnTouch( btnUndo_OnTouch );
	btnUndo.SetTextSize( noIcons?9:14, "pl");
	layEditBtns.AddChild( btnUndo );

	btnNew = app.CreateButton( noIcons?"File":"[fa-file-text]", 0.14, (tablet?0.04:0.06), "fontawesome" );
	btnNew.SetMargins( 0.01,0,0,0 );
	btnNew.SetOnTouch( btnNew_OnTouch );
	btnNew.SetTextSize( noIcons?9:14, "pl");
	layEditBtns.AddChild( btnNew );

	btnAsset = app.CreateButton( noIcons?"Assets":"[fa-picture-o]", 0.14, (tablet?0.04:0.06), "fontawesome" );
	btnAsset.SetMargins( 0.01,0,0,0 );
	btnAsset.SetOnTouch( btnAsset_OnTouch );
	btnAsset.SetTextSize( noIcons?9:14, "pl");
	layEditBtns.AddChild( btnAsset );

	btnDbg = app.CreateButton( noIcons?"Debug":"[fa-bug]", 0.14, (tablet?0.04:0.06), "fontawesome" );
	btnDbg.SetMargins( 0.01,0,0.01,0 );
	btnDbg.SetTextSize( noIcons?9:14, "pl");
	btnDbg.SetOnTouch( btnDbg_OnTouch );
	layEditBtns.AddChild( btnDbg );

	btnExec = app.CreateButton( noIcons?"Run":"[fa-play]", 0.14, (tablet?0.04:0.06), "fontawesome" );
	btnExec.SetMargins( 0,0,0.01,0 );
	btnExec.SetTextSize( noIcons?9:14, "pl");
	btnExec.SetOnTouch( btnExec_OnTouch );
	layEditBtns.AddChild( btnExec );

	btnRedo = app.CreateButton( noIcons?"Redo":"[fa-repeat]", 0.14, (tablet?0.04:0.06), "fontawesome" );
	btnRedo.SetOnTouch( btnRedo_OnTouch );
	btnRedo.SetTextSize( noIcons?9:14, "pl");
	layEditBtns.AddChild( btnRedo );

	layEdit.AddChild( layEditBtns );
	layFlip.AddChild( layEdit );

	//Create launcher layout.
	layLaunch = app.CreateLayout( "Linear" );
	layFlip.AddChild( layLaunch );

	//Create program list control.
	layLst = app.CreateLayout( "Frame");
	if( useDarkTheme ) layLst.SetBackground( "/assets/ide/android_dark.png" );
	else layLst.SetBackground( "/assets/ide/android.png" );
	layLaunch.AddChild( layLst );

	//Create AdView.
	bannerHeight = app.IsPortrait()?0.08:0.12
	//ads = app.CreateAdView( "dummy_ad_id", "", 1, bannerHeight );
	ads = app.CreateLayout( "Linear", "VCenter" )
	ads.SetSize( 1, bannerHeight );
	ads.Load = ()=>{}
	//ads.SetOnStatus( ads_OnStatus );
	if( app.IsNewVersion() ) {
	  txtTips = app.AddText( ads, "Tip: Long press an icon to edit the code" )
      txtTips.SetTextSize( 18 )
	}
	else {
	    ads.SetBackground( "/Sys/Img/Banner.png" );
	    ads.SetOnTouchUp( ()=>{ShowPremium()} )
	}
	layLaunch.AddChild( ads );
	setTimeout( ()=>{ if(!premium) ads_OnStatus('ERROR')}, 4000 );

	//Show user's program icons if starting in portrait
	//mode, else it's done in OnConfig.
	if( startOrient=="Portrait" ) ShowIcons();
	layFront.AddChild( layFlip );

	//--- Custom slide down options layout -----
	layMenus = app.CreateLayout( "Absolute", "fillxy,touchthrough" );
	layMenu = app.CreateLayout( "Linear" );
	//layMenu.SetMargins( 0.15, (tablet?0.065:0.076), 0,0 );
	layMenu.SetPosition( 0.50, (tablet?0.065:0.076) );
	layMenu.SetVisibility( "Hide" );
	layMenus.AddChild( layMenu );

	lstMenu = app.CreateList( "", 0.3,-1, "FillXY,normal" );
	lstMenu.SetPadding( 0,0.005,0,0,0 );
	lstMenu.SetBackColor( "#2E3134" );
	lstMenu.SetTextSize( 18, "dip" );
	lstMenu.SetOnTouch( lstMenu_OnTouch );
	layMenu.AddChild( lstMenu );
	LoadMenus();

	//--- Slide down file list -----

	layFiles = app.CreateLayout( "Absolute", "fillxy,touchthrough" );
	layFile = app.CreateLayout( "Linear" );
	//layFile.SetMargins( 0.15, (tablet?0.065:0.076), 0,0 );
	layFile.SetPosition( isPortrait?0.3:0.385, topBarHeight );
	layFile.SetVisibility( "Hide" );
	layFiles.AddChild( layFile );

	lstFiles = app.CreateList( "", 0.4,1-topBarHeight, "Normal" );
	lstFiles.SetPadding( 0,0.005,0,0,0 );
	lstFiles.SetBackColor( "#2E3134" );
	lstFiles.SetTextSize( lowRes?16:18, "dip" );
	lstFiles.SetOnTouch( lstFiles_OnTouch );
	lstFiles.SetOnLongTouch( lstFiles_OnLongTouch );
	layFile.AddChild( lstFiles );

	//=== Right Extensions Tabs ==================================================

	//Create an (initially invisible) layout to show samples.
	layRight = app.CreateLayout( "Absolute", "fillxy,touchthrough" );
	layRight.SetVisibility( "Hide" );
	tabsRight = app.CreateTabs( (v3?"[fa-home],[fa-book],":"")+"[fa-rocket],[fa-shopping-cart],[fa-comments],[fa-terminal]",
	        1, (lowRes?0.83:(tablet?0.92:0.92)), "Fade,NoMargins,FontAwesome,AutoSize" );
	tabsRight.SetOnChange( tabsRight_OnChange );
	layRight.AddChild( tabsRight );


    //---- Home tab --------------------
    if( v3 )  {
        //Create Home tab
        layHomeTab = tabsRight.GetLayout( "[fa-home]" );
        layHome = app.CreateLayout( "linear", "vertical,fillxy" );
        layHomeTab.AddChild( layHome );

        //Create webview control for Chat.
        webHome = app.CreateWebView( isChrome?0.5:1, -1, "IgnoreErrors,FillY,progress,usebrowser" );
        webHome.SetMargins( 0,0.01,0,0 )
        webHome.SetBackColor( useDarkTheme ? "#252a2b" || "#222222" : "#fefefe" );
        layHome.AddChild( webHome );

        tabsRight_OnChange( "[fa-home]" )
	}

    //--- Documentation tab -------

    if( v3 ) {
        //Create Docs tab
        layDocTab = tabsRight.GetLayout( "[fa-book]" );
        layDocs = app.CreateLayout( "linear", "vertical,fillxy" );
        layDocTab.AddChild( layDocs );

        //Create webview control for docs.
        webDocs = app.CreateWebView( isChrome?0.5:1, -1, "IgnoreErrors,FillY,progress,AllowRemote,usebasicinput" );
        webDocs.SetMargins( 0,0.01,0,0 )
        webDocs.SetBackColor( useDarkTheme ? "#252a2b" || "#222222" : "#fefefe" );
        layDocs.AddChild( webDocs );
        webDocs.SetOnConsole(webDocs_OnConsole);

        //Set language and load docs.
        SetLanguage();
        //tabsRight_OnChange( "[fa-book]" )
    }

	//--- Samples tab -------------------

	//Create Samples tab
    laySampTab = tabsRight.GetLayout( "[fa-rocket]" );
    layExamp = app.CreateLayout( "Frame", "vertical,fillxy,autosize" );
    //layExamp.SetBackColor( "blue" )
	if( true ) {
        //Create webview control for Samples.
        webSamples = app.CreateWebView( isChrome?0.5:1, -1, "IgnoreErrors,FillY,progress,AllowRemote,usebasicinput" );
        webSamples.SetMargins( 0,0.01,0,0 )
        webSamples.SetBackColor( useDarkTheme ? "#252a2b" || "#222222" : "#fefefe" );
        layExamp.AddChild( webSamples );
        //setTimeout( ()=> { webSamples.LoadUrl( "http://127.0.0.1:8088/Extensions/Samples/Right/Samples.html" )}, 5000 )
	}
	else {
        layExamp.SetMargins( 0,0.01,0,0 )
        layExamp.SetBackColor( "#222222" );
        CreateSamplesList();
	}
	laySampTab.AddChild( layExamp );

    //--- Store tab -------------

	//Create Store tab
	layStoreTab = tabsRight.GetLayout( "[fa-shopping-cart]" );
	layStore = app.CreateLayout( "linear", "vertical,fillxy" );
	layStoreTab.AddChild( layStore );

	//Create webview control for Store.
	webStore = app.CreateWebView( isChrome?0.5:1, -1, "IgnoreErrors,FillY,usebasicinput" );
	webStore.SetMargins( 0,0.01,0,0 )
	webStore.SetBackColor( useDarkTheme ? "#252a2b" || "#222222" : "#fefefe" );
	webStore.SetUseBrowser( "^(?:(?!q=).)*$" )
	//webStore.LoadHtml("<div style='color:grey;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);'>Loading...</div>");
//	webStore.SetOnProgress( webStore_OnProgess );
	//webStore.SetOnConsole( webStore_OnConsole )
	//webStore.SetOnUrl( webStore_OnUrl )
	layStore.AddChild( webStore );
	//webStore.Hide() //<-- hide store to start with to prevent white flash.

    //---- Chat tab --------------------
    //if( v3 )  {
        //Create Chat tab
        layChatTab = tabsRight.GetLayout( "[fa-comments]" );
        layChat = app.CreateLayout( "linear", "vertical,fillxy" );
        layChatTab.AddChild( layChat );

        //Create webview control for Chat. (note: can't use 'UseBrowser' mode or login jumps out)
        webChat = app.CreateWebView( isChrome?0.5:1, -1, "IgnoreErrors,FillY,progress,NoPause,usebasicinput" );
        webChat.SetMargins( 0,0.01,0,0 )
        webChat.SetBackColor( useDarkTheme ? "#252a2b" || "#222222" : "#fefefe" );
        layChat.AddChild( webChat );
	//}

    //--- Terminal tab ---------------

    //Create Terminal tab
    layTermTab = tabsRight.GetLayout( "[fa-terminal]" );
    layTerm = app.CreateLayout( "linear", "vertical,fillxy" );
    layTermTab.AddChild( layTerm );

    //Create webview control for terminal.
    webTerm = app.CreateWebView( isChrome?0.5:1, -1, "IgnorXeErrors,FillY,progress,NoPause,usebasicinput" );
    webTerm.SetMargins( 0,0.01,0,0 )
    webTerm.SetBackColor( useDarkTheme ? "#252a2b" || "#222222" : "#fefefe" );
    webTerm.SetOnError( (e)=>{ console.log(e) } )
    layTerm.AddChild( webTerm );

    //----- Samples editor ---------
    if( false )  {
        //Create text control showing sample code.
        layEditSamp = app.CreateLayout( "Linear", "Vertical,FillXY,autosize" );
        layEditSamp.Hide();
        editSamp = app.CreateCodeEdit( "", 1, (lowRes?0.83:(tablet?0.88:0.86)), "NoSpell,NoKeyboard" );
        if( useDarkTheme ) editSamp.SetColorScheme( "Dark" );
        editSamp.SetTextSize( textSize );
        editSamp.SetPadding( 0.02,0,0,0 ); //<-needed for keyboard space.
        editSamp.SetOnDoubleTap( edit_OnDoubleTap );
        editSamp.SetNavigationMethod( useYoyo ? "Yoyo" : "Touch" );
        layEditSamp.AddChild( editSamp );

        //Create horizontal layout for buttons.
        layBtns = app.CreateLayout( "Linear", "Horizontal,VCenter,FillX" );
        layBtns.SetBackColor( "#26282A" );
        layBtns.SetPadding( 0,0.006,0,0.006 );

        //Create button to zoom out.
       // btnZoomOut = app.CreateButton( "-", 0.16, 0.05, "gray" );
       // btnZoomOut.SetOnTouch( btnZoomOut_OnTouch );
        //layBtns.AddChild( btnZoomOut );

        //Create button to copy sample.
        btnCopy = app.CreateButton( noIcons?"Copy":"[fa-copy]", 0.26, (tablet?0.04:0.06), "fontawesome" );
        btnCopy.SetMargins( 0.08,0,0.08,0 );
        btnCopy.SetTextSize( 14, "pl");
        btnCopy.SetOnTouch( btnCopy_OnTouch );
        layBtns.AddChild( btnCopy );

        //Create button to launch sample.
        btnRun = app.CreateButton( noIcons?"Run":"[fa-play]", 0.26, (tablet?0.04:0.06), "fontawesome" );
        btnRun.SetMargins( 0.08,0,0.08,0 );
        btnRun.SetTextSize( 14, "pl");
        btnRun.SetOnTouch( btnRun_OnTouch );
        layBtns.AddChild( btnRun );

        //Create button to zoom in.
       // btnZoomIn = app.CreateButton( "+", 0.16, 0.05, "gray" );
       // btnZoomIn.SetOnTouch( btnZoomIn_OnTouch );
       // layBtns.AddChild( btnZoomIn );

        layEditSamp.AddChild( layBtns );
	    layExamp.AddChild( layEditSamp );
	}

    //===  Left Extensions Tabs =============================================

    //Create an (initially invisible) slide-out layout to show extensions.
    layLeft = app.CreateLayout( "Absolute", "fillxy,touchthrough" );
    layLeft.SetVisibility( "Hide" );
    var list = "[fa-book],[fa-pencil-square-o],[fa-folder],[fa-cloud],[fa-microchip]"
    if( v3 )  list = "[fa-sitemap],[fa-pencil-square-o],[fa-folder],[fa-cloud]"
    tabsLeft = app.CreateTabs( list, 1, (lowRes?0.83:(tablet?0.92:0.92)), "Fade,NoMargins,FontAwesome,AutoSize" );
    tabsLeft.SetOnChange( tabsLeft_OnChange );
    layLeft.AddChild( tabsLeft );

	//--- Documentation tab -------

    if( !v3 ) {
        //Create Docs tab
        layDocTab = tabsLeft.GetLayout( "[fa-book]" );
        layDocs = app.CreateLayout( "linear", "vertical,fillxy" );
        layDocTab.AddChild( layDocs );

        //Create webview control for docs.
        webDocs = app.CreateWebView( isChrome?0.5:1, -1, "IgnoreErrors,FillY,progress,AllowRemote,usebasicinput" );
        webDocs.SetMargins( 0,0.01,0,0 )
        webDocs.SetBackColor( useDarkTheme ? "#252a2b" || "#222222" : "#fefefe" );
        layDocs.AddChild( webDocs );
        webDocs.SetOnConsole(webDocs_OnConsole);

        //Set language and load docs.
        SetLanguage();
        tabsRight_OnChange( "[fa-book]" )
    }

    /* old version
	layWeb.SetBackGradient( "#ffdddddd", "#ffaaaaaa" );
	webDocs = app.CreateWebView( 1.0, 1-topBarHeight-bottomBarHeight, "NoLongTouch,IgnoreErrors,ScrollFade" );
	SetLanguage();
	*/

    //--- Project tab ----------

    if( v3 ) {
        //Create Project tab
        layProjectTab = tabsLeft.GetLayout( "[fa-sitemap]" );
        layProject = app.CreateLayout( "linear", "vertical,fillxy" );
        layProjectTab.AddChild( layProject );

        //Create webview control for Project viewer.
        webProject = app.CreateWebView( isChrome?0.5:1, -1, "IgnoreErrors,FillY,progress,AllowRemote,usebasicinput" );
        webProject.SetMargins( 0,0.01,0,0 )
        webProject.SetBackColor( useDarkTheme ? "#252a2b" || "#222222" : "#fefefe" );
        layProject.AddChild( webProject );
        webProject.data.changed = true
    }

    //--- File browser tab ----------

    if( true ) {
        //Create FileBrowser tab
        layFileBrowserTab = tabsLeft.GetLayout( "[fa-folder]" );
        layFileBrowser = app.CreateLayout( "linear", "vertical,fillxy" );
        layFileBrowserTab.AddChild( layFileBrowser );

        //Create webview control for filebrowser.
        webFileBrowser = app.CreateWebView( isChrome?0.5:1, -1, "IgnoreErrors,FillY,progress,AllowRemote,UseBrowser,usebasicinput" );
        //webFileBrowser.SetUserAgent( "_ds_ide_", "add" )
        webFileBrowser.SetOnBlob( (data,name)=>{
            app.WriteFile( tempFldr+"/"+name, data, "base64" )
            app.SendFile( tempFldr+"/"+name, name)
        })
        webFileBrowser.SetMargins( 0,0.01,0,0 )
        webFileBrowser.SetBackColor( useDarkTheme ? "#252a2b" || "#222222" : "#fefefe" );
        layFileBrowser.AddChild( webFileBrowser );
    }

    //--- Scratchpad tab ------------

	if( true ) {
        //Create Scratchpad tab
        layScratchTab = tabsLeft.GetLayout( "[fa-pencil-square-o]" );
        layScratch = app.CreateLayout( "linear", "vertical,fillxy" );
        layScratchTab.AddChild( layScratch );

        //Create webview control for filebrowser.
        webScratch = app.CreateWebView( isChrome?0.5:1, -1, "IgnoreErrors,FillY,progress,local,usebasicinput" );
        webScratch.SetMargins( 0,0.01,0,0 )
        webScratch.SetBackColor( useDarkTheme ? "#252a2b" || "#222222" : "#fefefe" );
        layScratch.AddChild( webScratch );
     }

    //--- Cloud tab ------------

    if( true ) {
        //Create tab
        layCloudTab = tabsLeft.GetLayout( "[fa-cloud]" );
        layCloud = app.CreateLayout( "linear", "vertical,fillxy" );
        layCloudTab.AddChild( layCloud );

        //Create webview control.
        webCloud = app.CreateWebView( isChrome?0.5:1, -1, "IgnoreErrors,FillY,progress,local,UseBrowser,usebasicinput" );
        webCloud.SetMargins( 0,0.01,0,0 )
        webCloud.SetBackColor( useDarkTheme ? "#252a2b" || "#222222" : "#fefefe" );
        layCloud.AddChild( webCloud );
        //setTimeout( ()=>{ webCloud.LoadUrl( "http://127.0.0.1:8088/Extensions/Cloud/Left/Cloud.html?ismobile=true" )}, 5000 )
     }

     //--- Microcontroller tab ------------

     if( true ) {
         //Create tab
         layChipTab = tabsLeft.GetLayout( "[fa-microchip]" );
         layChip = app.CreateLayout( "linear", "vertical,fillxy" );
         layChipTab.AddChild( layChip );

         //Create webview control.
         webChip = app.CreateWebView( isChrome?0.5:1, -1, "IgnoreErrors,FillY,progress,local,UseBrowser,noscrollbar,usebasicinput" );
         webChip.SetMargins( 0,0.01,0,0 )
         webChip.SetBackColor( useDarkTheme ? "#252a2b" || "#222222" : "#fefefe" );
         layChip.AddChild( webChip );
         //setTimeout( ()=>{ webChip.LoadUrl( "http://127.0.0.1:8088/Extensions/Microcontroller/Left/Microcontroller.html?ismobile=true" )}, 5000 )
      }


	//---------------------------------

	//Adjust layout according to orientation.
	AdjustLayout();

	//Hide main layout if required.
	if( sharedApp ) layFront.SetVisibility("Hide");

	//Add main layouts to app.
	app.AddLayout( layBack );
	app.AddLayout( layFront );
	app.AddLayout( layRight );
	app.AddLayout( layLeft );

	//Create popup coding menus.
    CreateCodingMenus();
}

//Create list of samples.
function CreateSamplesList()
{
	if( lstSamp ) layExamp.DestroyChild( lstSamp )
	var listArray = GetSamples();
	//var bkcol = useDarkTheme ? "BlackGrad" : "WhiteGrad"
	lstSamp = app.CreateList( listArray, -1, -1, "FillXY,Html", "\\|" );
	lstSamp.SetBackColor( useDarkTheme ? "#26282A" : "#fefefe" );
	lstSamp.SetTextColor1( useDarkTheme ? "#fafafa" : "#444444" );
	lstSamp.SetTextColor2(  useDarkTheme ? "#a8a8a8" : "gray" );
	lstSamp.SetTextMargins( 0.04, 0, 0, 0 );
	lstSamp.SetOnTouch( lstSamp_OnTouch );
	lstSamp.SetOnLongTouch( lstSamp_OnLongTouch );
	layExamp.AddChild( lstSamp, 0 );
}

//Handle samples/store tab selection.
function tabsRight_OnChange( name )
{
    if ( name=="[fa-home]" && ( !webHome.GetUrl() || webHome.LoadFailed() ) ) {
        //https://publish.twitter.com/
        /* too slow!
        var html = '<a class="twitter-timeline" data-lang="en" data-dnt="true" data-theme="dark"'
                + ' href="https://twitter.com/droidscript?ref_src=twsrc%5Etfw">Tweets by droidscript</a>'
                + ' <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>'
        */
        var html = "<div style='color:grey;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);'>News feed coming soon!</div>"
        webHome.LoadHtml( html )
    }
    else if( v3 && name=="[fa-book]" && !webDocs.GetUrl() ) {
        webDocs.LoadUrl( "file://" + docsPath + "/Docs.html?ds=true" );
    }
    else if ( true && name=="[fa-rocket]" && ( !webSamples.GetUrl() || webSamples.LoadFailed() ) ) {
        webSamples.LoadUrl( "http://127.0.0.1:8088/Extensions/Samples/Right/Samples.html" )
    }
    else if( name=="[fa-shopping-cart]" && ( !webStore.GetUrl() || webStore.LoadFailed() ) /*&& webStore.GetUrl().includes("Offline")*/ ) {
        webStore.LoadUrl( storeUrl + "?type=spk&app=1&theme=" + (useDarkTheme?"dark" :"light") );
    }
    else if ( name=="[fa-terminal]" && ( !webTerm.GetUrl() || webTerm.LoadFailed() ) ) {

        if( !premium ) { alert( "SSH / Device Terminal is a Premium feature!" ); return; }
        //StartNodeServer( function(){
            var path = "/storage/emulated/0/DroidScript/Extensions/RemoteTerminal/Right/RemoteTerminal.html";
            var terminalHtml = app.ReadFile(path).replace(/(\/.edit)/g, "../../..$1")
            var basePath = path.slice(0, -("RemoteTerminal.html".length))
            webTerm.LoadHtml( terminalHtml, basePath )
            webTerm.SetOnProgress( function(prog){
                if( prog==100 ) {
                    webTerm.Execute(`SOCKET_URL = "ws://${app.GetIPAddress()}:8011"`)
                    webTerm.Execute("ext_OnSelect()")
                }
            } )
        //} )
    }
    else if ( name=="[fa-comments]" ) {
        if( !webChat.GetUrl() || webChat.LoadFailed() ) {
            //webChat.LoadUrl( "https://discord.com/channels/985908716060684388/986194816813658132" )
            webChat.LoadUrl( "https://forum.droidscript.org/" )
        }
        //else webChat.Execute( "ext_OnSelect('"+name+"')" )
    }
    //else webChat.Execute( "ext_OnDeselect('"+name+"')" )
}

//Handle samples/store tab selection.
function tabsLeft_OnChange( name )
{
    if( !v3 && name=="[fa-book]" && !webDocs.GetUrl() ) {
        webDocs.LoadUrl( "file://" + docsPath + "/Docs.htm?ds=true" );
    }
    else if ( name=="[fa-sitemap]" ) {
        if( !webProject.GetUrl() || webProject.LoadFailed() ) {
             webProject.LoadUrl( "http://127.0.0.1:8088/Extensions/Project/Left/Project.html?ismobile=true" );
             webProject.SetOnProgress( (prog)=>{ if(prog==100){ webProject.Execute("ext.appName='"+curProgram+"'; ext_OnSelect()") }})
        }
        else webProject.Execute("ext.appName='"+curProgram+"';ext_OnSelect()")
        webProject.data.changed = false
    }
    else if ( name=="[fa-folder]" && ( !webFileBrowser.GetUrl() || webFileBrowser.LoadFailed() ) ) {
        if( !premium ) { alert( "File Browser is a Premium feature!" ); return; }
        webFileBrowser.LoadUrl( "http://127.0.0.1:8088/Extensions/FileManager/Left/FileManager.html?ismobile=true" )
    }
    else if( name=="[fa-pencil-square-o]" ) {
        if( !webScratch.GetUrl() ) {
             webScratch.LoadUrl( "/Storage/DroidScript/Extensions/ScratchPad/Left/ScratchPad.html?ismobile=true"  );
             webScratch.SetOnProgress( (prog)=>{ if(prog==100){ webScratch.Execute("ext_OnSelect()") }})
        }
        else webScratch.Execute("ext_OnSelect()")
     }
    else if( name=="[fa-cloud]" ) {
        if( !webCloud.GetUrl() ) {
            webCloud.LoadUrl( "http://127.0.0.1:8088/Extensions/Cloud/Left/Cloud.html?ismobile=true" )
            //webCloud.SetOnProgress( (prog)=>{ if(prog==100){ webCloud.Execute("/*ext.cloudKey='"+cloudKey+"';*/ ext_OnSelect()") }})
        }
        else webCloud.Execute("ext_OnSelect()")
     }
    else if( name=="[fa-microchip]" ) {
        if( !webChip.GetUrl() ) {
             webChip.LoadUrl( "http://127.0.0.1:8088/Extensions/Microcontroller/Left/Microcontroller.html?ismobile=true" )
             webChip.SetOnProgress( (prog)=>{ if(prog==100){ webChip.Execute("ext_OnSelect()") }})
        }
        else webChip.Execute("ext_OnSelect()")
    }
}

//Handle AdView events.
function ads_OnStatus( status )
{
	//Load alternative local image if add load error.
	if( status.includes("ERROR") )
	{
        //ads.SetBackground( "/Sys/Img/Banner.png" );
        clearInterval( tmrAds );
        tmrAds = setInterval( function(){ if(ads.IsVisible()) ads.Animate("TaDa")}, 10000 );
        ads.Animate("TaDa")
	}
	else if( status=="ALTERNATIVE" ) ShowPremium();
	else ads.SetBackColor( "#333333" );
}

//Handle console messages from Docs webview.
function webDocs_OnConsole(s)
{
	if(s.startsWith("agent = "))
		webDocs.Execute( "setTheme('" + (useDarkTheme? "dark" : "default") + "');" );
}

//Create a layout for Android/Google TV
function CreateTvLayout()
{
	lay = app.CreateLayout( "linear", "vcenter,fillxy" );
    lay.SetBackground( "/assets/ide/tvback.png" );

	//Create text for remote connection message.
	var ip = app.GetIPAddress()+":8088"
	var msg = "Type this address into your web browser"
	txtTv = app.AddText( lay, msg );
	txtTv.SetTextSize( 14 )
	txtTv.SetTextColor( "#888888" )
	txtTv.SetMargins( 0,0.15,0,0.05 )
	txtTvIp = app.AddText( lay, "[fa-wifi] "+ ip, -1,-1,"fontawesome" );
	txtTvIp.SetTextSize( 20 )

	app.AddLayout( lay );
}

//Create basic layout when running in chrome.
function CreateHeadlessLayout( debug )
{
	var msg;
	if( useADB ) msg = "Run 'DroidScript Connect' and type the following" +
		" address into your web browser:\n127.0.0.1:8088";
	else msg = app.GetIPAddress()+":8088";

	var lay = app.CreateLayout( "linear", "VCenter,FillXY" );
	lay.SetPadding( 0.04,0,0.04,0 );
	if( debug ) txtDebug = app.CreateText( msg,-1,-1,"FillXY,Log" );
	else txtDebug = app.CreateText( msg,-1,-1,"MultiLine" );
	txtDebug.SetTextSize( debug?12:22 );
	lay.AddChild( txtDebug );
	app.AddLayout( lay );

	//Capture remote logging.
	if( debug ) app.SetOnDebug( OnDebug );
}

//Create a theme for all controls and dialogs.
function CreateTheme()
{
	app.SetNavBarColor("#2E3134")


	if( isChrome && !noGUI )
	{
		theme = app.CreateTheme( "Light" );
		/*theme.AdjustColor( 35, 0, -10 );
		theme.SetBackColor( "#ffffffff" );
		theme.SetBtnTextColor( "#000000" );
		theme.SetButtonOptions( "custom" );
		theme.SetButtonStyle( "#fafafa","#fafafa",5,"#999999",0,1,"#ff9000" );
		theme.SetCheckBoxOptions( "dark" );
		theme.SetTextEditOptions( "underline" );
		theme.SetDialogColor( "#eeeeee" );
		theme.SetDialogBtnColor( "#ffeeeeee" );
		theme.SetDialogBtnTxtColor( "#ff666666" );
		theme.SetTitleHeight( 36 );
		theme.SetTitleColor( "#ff888888" );
		theme.SetTitleDividerColor( "#cccccc" );
		theme.SetTextColor( "#000000" );
		*/
	}
	else
	{
		theme = app.CreateTheme( "Dark" );
		/*theme = app.CreateTheme( "Dark_Old" );
		theme.SetBackColor( "#bb000000" );
		theme.SetDialogColor( "#bb000000" );
		*/
	}

	theme.SetButtonPadding( 10,5,10,7,"dp" );
	app.SetTheme( theme );
}

//Send remote debug messages to headless log.
function OnDebug( msg )
{
	if( txtDebug ) txtDebug.Log( msg );
}

//Create webview based layout when running on Vim/Chromebook.
function CreateAceLayout()
{
	usingAce = true;

	lay = app.CreateLayout( "linear", "VCenter,FillXY" );
	lay.SetBackColor( "black" );

	//Create text for remote connection message.
	txtRemote = app.CreateText( "",-1,-1,"fontawesome,multiline" );
	txtRemote.SetTextSize( 16 );
	txtRemote.SetOnTouchDown( txtRemote_OnTouchDown );
	txtRemote.Gone();
	lay.AddChild( txtRemote );

	webAce = app.CreateWebView( -1,-1, "IgnoreErrors,FillXY,NoActionBar" );
	webAce.Focus();
	app.SetOptions( "AllowRemote" );
	lay.AddChild( webAce );

	layMenus = app.CreateLayout( "Absolute", "fillxy,touchthrough" );
	layMenus.SetOnTouchDown( function(){ if(layMenu.IsVisible()) btnMenu_OnTouch()} );
	layMenu = app.CreateLayout( "Linear", "filxlxy" );
	layMenu.SetPosition( 0.84, 0.08 );
	//layMenu.SetMargins( 8,8,8,8, "dip" );
	//layMenu.SetMargins( 0.15, (tablet?0.065:0.076), 0,0 );
	layMenu.SetVisibility( "Hide" );
	layMenus.AddChild( layMenu );

	var layFrame = app.CreateLayout( "Linear" );
	layFrame.SetBackground( "/res/drawable/picture_frame" );
	layMenu.AddChild( layFrame );

	var sdk = (g_sdk ? ",SDK": "" );
	var menu = "Plugins,Premium"+sdk+",About,Save SPK,Build APK,Build AAB";
	lstMenu = app.CreateList( menu, 0.16,-1, "Menu,Expand" );
	lstMenu.SetPadding( 0,0,0,0,0 );
	lstMenu.SetBackColor( "#ffffff" );
	lstMenu.SetTextSize( 10 );
	lstMenu.SetOnTouch( lstMenu_OnTouch );
	layFrame.AddChild( lstMenu );

	app.AddLayout( lay );
	app.AddLayout( layMenus );

	//setTimeout( function(){ webAce.LoadUrl("file:///sdcard/DroidScript/.edit/index.html"); }, 500 );
	//setTimeout( function(){ webAce.LoadUrl("http:///127.0.0.1:8088"); }, 500 ); //500
}

//Disconnect a remote IDE user.
function txtRemote_OnTouchDown()
{
	var yesNo = app.CreateYesNoDialog( T("Disconnect")+"?" );
	yesNo.SetOnTouch( OnDisconnect );
	yesNo.Show();
}

//Handle disconnect dialog.
function OnDisconnect( result )
{
	if( result=="Yes" )
	{
		//app.StopDebugServer();
		app.StartDebugServer( "local" );
		OnIdeDisconnect("*");
		if( !webAce ) { btnConnect.SetTextColor("#999999"); ShowIcons(); }
		else { app.StartDebugServer(); webAce.Execute("onStop()"); }
	}
}

//Launch remix browser link,
function txtRemix_OnTouchDown()
{
	app.OpenUrl( "http://127.0.0.1:8088" );
}

//Handle soft-keyboard show and hide.
function app_OnShowKeyBoard( shown )
{
    if( layRight.IsVisible() ) {
        if( layChatTab && layChatTab.IsVisible() ) {
            if( shown ) webChat.SetSize( app.GetDisplayWidth(), app.GetDisplayHeight() - app.GetKeyboardHeight(), "px")
            else { webChat.SetSize( isChrome?0.5:1, -1, "FillY" ); webChat.SetMargins( 0,0.01,0,0 ) }
        }
        else if( layTermTab && layTermTab.IsVisible() ) {
            if( shown ) webTerm.SetSize( app.GetDisplayWidth(), app.GetDisplayHeight() - app.GetKeyboardHeight(), "px")
            else { webTerm.SetSize( isChrome?0.5:1, -1, "FillY" ); webTerm.SetMargins( 0,0.01,0,0 ) }
        }
    }
    else if( layLeft.IsVisible() ) {
         if( layChipTab && layChipTab.IsVisible() ) {
            if( shown ) webChip.SetSize( app.GetDisplayWidth(), app.GetDisplayHeight() - app.GetKeyboardHeight(), "px")
            else { webChip.SetSize( isChrome?0.5:1, -1, "FillY" ); webChip.SetMargins( 0,0.01,0,0 ) }
        }
    }
    else {
    	if( !headless ) ResizeCodingMenus();
    	if( term ) term.Resize();
    }
}

//Create icon layout to show user's programs.
function ShowIcons( force )
{
	if( headless ) return;

    //Get list of user's programs.
	var progList = GetProgramList();

	//Check if changed
	var progs = progList.toString()
	if( !force && progs==lastProgs ) return
	lastProgs = progs

	//Remove current icon layout (and free old objects).
	if( scrollIcons ) layLst.DestroyChild( scrollIcons );

	//Create scroller (only show adds if not premium and in portrait mode).
	var portrait = app.IsPortrait()
	if( premium || !portrait ) ads.Gone(); else ads.Show()
	layLst.SetSize( 1, (!premium&&portrait?1-bannerHeight:1)-topBarHeight )
	scrollIcons = app.CreateScroller( 1, (!premium&&app.IsPortrait()?1-bannerHeight:1)-topBarHeight );

	//Create icon layout.
	layIcons = app.CreateLayout( "Linear", "FillXY,Left" );
	layIcons.SetPadding(0,0.02,0,0);
	scrollIcons.AddChild( layIcons );

	//Set icons per row count.
	var iconsPerRow = tablet ? 5 : 4;
	if( orient=="Landscape" ) { iconsPerRow = tablet ? 8 : 7; }
	var iconW = 0.76/iconsPerRow;

	//Create an icon for each program.
	for( var i=0; i<progList.length && progList[0]!=""; i++ )
	{
		if( i%iconsPerRow==0 )
			layIconsHoriz = app.AddLayout( layIcons, "Linear", "Horizontal" );

		//Create icon/text layout.
		var layIcon = app.AddLayout( layIconsHoriz, "Linear", "Vertical" );
		layIcon.SetMargins( 0.082/iconsPerRow, 0, 0.082/iconsPerRow, 0 );

		//Get program icon.
		var file = appPath+"/"+progList[i]+"/Img/"+progList[i]+".png";
		if( !app.FileExists( file ) ) {
		    file = appPath+"/"+progList[i]+"/Img/app-icon.png";
		    if( !app.FileExists( file ) ) file = "/assets/Img/Icon.png";
		}

		//Create icon image.
		var imgIcon = app.AddImage( layIcon, file, iconW, iconW*aspect, 'async','','' );
		imgIcon.data.name = progList[i];
		imgIcon.Batch( { SetOnTouchUp:[lst_OnTouchUp], SetOnTouchDown:[lst_OnTouchDown], SetOnLongTouch:[lst_OnLongTouch] } )

		//Create text label.
		var lbl = progList[i]
		var txtIcon = app.AddText( layIcon, lbl, iconW*1.1, -1, "Multiline,html" );
		if( !useDarkTheme ) txtIcon.SetTextColor( "#222222" )
        if( lowRes ) txtIcon.SetTextSize(14,"dip");

        //Give up some time for the spinner to draw.
        app.UpdateUI(2)
	}

	layLst.AddChild( scrollIcons );
}

//Get user program list (excluding folders with ~ char at start).
function GetProgramList()
{
	var progList = [];
	var list = app.ListFolder( appPath,"",0,"alphasort,project");
	for( var i=0; i<list.length; i++ )
	{
		if( list[i].substr(0,1) == '~' ) continue;
		progList.push(list[i]);
	}
	return progList;
}

//Get list of files in current program.
function GetFilesList()
{
	//List files in this project.
	var progPath = appPath+"/"+curProgram;
	var pattern = "(?!~.*)(.*\.js|.*\.html|.*\.txt|.*\.css|.*\.json|.*\.py)";
	var list = app.ListFolder( progPath,pattern,0,"alphasort,regex,files");

	//Put main file to front of list.
	if( curProgTitle )
	{
		var idx = list.indexOf( curProgTitle );
		list.splice(idx, 1);
		list.unshift( curProgTitle );
	}
	return list;
}

//Handle program selection.
function lst_OnTouchDown( e )
{
	imgTouchedIcon = app.GetLastImage();
	if( imgTouchedIcon ) {
		imgTouchedIcon.SetAlpha( 0.6 );
		setTimeout( function(){imgTouchedIcon.SetAlpha( 1.0 )}, 1000 );
	}
}
//Handle program selection.
function lst_OnTouchUp( e )
{
	var img = app.GetLastImage();
	if( img ) img.SetAlpha( 1.0 );

	//Execute program.
	isWebIDE = false;
	LaunchApp( e.source.data.name, "" );

	//Save last app and IDE type.
	app.SaveText( "_LastApp", e.source.data.name, "spremote" );
	app.SaveText( "_IdeType", "device", "spremote" );
}

//Run a demo (from the docs)
function RunDemo( file )
{
	try {
		StartApp( file, "" );
	}
	catch(e) { alert("Whoops! Something went wrong :("); }
}

//Start an app after scanning for required perms.
function StartApp( file, ops, intent )
{
	//Read the build file.
	build = ReadBuildFile()

	//Check for type of app.
	var scanFile = file;
	var htmlFile = file.replace(".js",".html");
	if( app.FileExists( htmlFile ) ) scanFile = htmlFile;
	var blocksFile = file.replace(".js",".dsj.js");
	if( app.FileExists( blocksFile ) ) scanFile = file = blocksFile;
	var pythonFile = file.replace(".js",".py");
    if( app.FileExists( pythonFile ) ) scanFile = pythonFile;

	//Check if we need more dangerous permissions (eg. camera)
	//and check for cfg.* options.
	permissions = ""; options = (ops?ops:""); makePlugin = false;
	ScanFile( scanFile, true );

	//Ask for permissions if necessary.
	if( permissions && build.autoPermissions!=false ) {
		var needed = app.CheckPermission( permissions );
		if( needed ) {
			app.GetPermission( needed, function(p) {
					if( !p || build.noPermsAction=="continue" ) StartApp(file,options,intent);
					else { if( build.noPermsAction!="exit" ) alert("Missing Permissions!") }
				});
			return;
		}
	}

	//Copy in template html file for python apps.
	//(Note: Python apps can have both 'python' and 'hybrid' options)
    if( file.endsWith(".py") )
    {
        //Execute python samples in demo folder.
        if( isSample ) {
            var js = app.ReadFile( file )
            file = tempFldr + "/demo.py"
            app.WriteFile( file, js )
        }
        //Get template html file.
        var fileTitle = file.substr( file.lastIndexOf("/")+1 )
        var pythonFile = file.replace(fileTitle,"~"+fileTitle).replace( ".py", ".html" )
        var html = app.ReadFile( "/Sys/ide/python_"+(options.includes("Hybrid")?"hybrid":"native")+".html" )
        html = html.replace( "main.py", fileTitle )
        app.WriteFile( pythonFile, html )
    }

	//Copy in template html file for hybrid apps.
	else if( options.includes("Hybrid") )
	{
	    //Execute hybrid samples in demo folder.
        if( isSample ) {
            var js = app.ReadFile( file )
            file = tempFldr + "/demo.js"
            app.WriteFile( file, js )
        }
        //Get standard index.html file.
	    var fileTitle = file.substr( file.lastIndexOf("/")+1 )
	    var hybridFile = file.replace(fileTitle,"~"+fileTitle).replace( ".js", ".html" )
	    var html = app.ReadFile( "/Plugins/ui/index.html" )

        //Set appropriate replace string.
        var rep = "<script>_hybrid=false; _cdn=false;</script>"
        if( !html.includes(rep) ) rep = "<script>_hybrid=false</script>"

        //Modify index.html file for DS use.
        html = html.replace( rep,
            "<script>_hybrid=true</script>\n    " +
            "<script src=\"ds:/Sys/app.js\"></script>\n    " +
            "<script src=\"ds:/Sys/compat.js\"></script>\n" )
	    html = html.replace( "\"libs/ui.js\"", "\"ds:/Plugins/ui/libs/ui.js\""  )
	    //html = html.replace( "<script src=\"libs/obj.js\"></script>", ""  )
	    html = html.replace( "\"libs/obj.js\"", "\"ds:/Plugins/ui/libs/obj.js\""  )
	    html = html.replace( "\"libs/enjine-ui.js\"", "\"ds:/Plugins/ui/libs/enjine-ui.js\""  )

	    if( HasOption("esm") ) {
	        html = html.replace( "<script src=\"main.js\"></script>", "" )
	        html = html.replace( "  </head>", "    <script type=\"module\">\n      import * as _exports from \"ds:/"
	            + fileTitle + "\"\n      if( typeof _exports.onStart=='function' ) _exports.onStart();"
	            + " else window.main = new _exports.Main()\n"
	            + "      window.OnStart=_exports.onStart;\n      window.OnBack=_exports.onBack;\n      window.OnData=_exports.onData;\n"
                + "      window.OnPause=_exports.onPause;\n      window.OnResume=_exports.onResume;\n      window.OnConfig=_exports.onConfig;\n"
                + "    </script>\n  </head>" )
	        html = html.replace( "<body onload=\"if( typeof onStart=='function' ) onStart(); else main = new Main()\">", "<body>" )
	    }
        else html = html.replace( "\"main.js\"", "\""+fileTitle+"\"" )

	    html = html.replace( RegExp("\"libs/","gim"), "\"ds:/Plugins/ui/libs/" )
	    //html = html.replace( RegExp("onStart","gim"), "OnStart" )
	    app.WriteFile( hybridFile, html )

	    //Temporary fix for ui.js containing app.GetPrivateFolder (obfuscating breaks it)
	    var js = app.ReadFile( "/Plugins/ui/libs/ui.js" )
	    js = js.replace( RegExp("app.GetPrivateFolder","gim"), "_Private" )
	    app.WriteFile( "/Plugins/ui/libs/ui.js", js )
	}

    //Check if we need to send a script to microcontroller first (must be connected).
    var microFile = appPath+"/"+curProgram+"/micro_main.py"
    if( app.FileExists( microFile ) ) {
        node.Execute( "rpc.api.board.execFile('"+microFile+"')", "ext_Microcontroller" )
    }
	//Start the app.
	app.StartApp( file, options, intent );

	//Refresh plugins if we were building a plugin.
	if( makePlugin ) setTimeout( function(){ListPlugins(false)}, 3000 )
}

//Read build file (and do some sanitch checks)
function ReadBuildFile()
{
	var build = {}
	var file = appPath+"/"+curProgram+"/build.json"
	if( !app.FileExists( file ) ) return build
	try {
	    build = JSON.parse( app.ReadFile( file ))
	    if( build.obfuscate && !Array.isArray( build.obfuscate ) )
	        alert( "ERROR: Invalid build.json file" )
	}
	catch(e){ alert( "ERROR: Invalid build.json file" ) }
	return build
}

//Set the current program.
function SetCurProg( name )
{
    curProgram = name
    if( node ) node.SetEnv( "DS_PROJECT", curProgram ? curProgram : "" )
    if( v3 ) { webProject.data.changed = true; webProject.Execute("ext_OnProject('"+curProgram+"')") }
}

//Execute program in it's own process.
function LaunchApp( name, intent, options )
{
	//Set current program name.
	isSample = false;
	SetCurProg( name )

	//Check for html app.
	var htmfile = appPath+"/"+curProgram+"/"+curProgram+".html"
	isHtml = app.FileExists( htmfile );

	//Check for blocks app.
	var blocksFile = appPath+"/"+curProgram+"/"+curProgram+".dsj"
	isBlocks =  app.FileExists( blocksFile );

	//Check for python app.
    var pythonFile = appPath+"/"+curProgram+"/"+curProgram+".py"
    isPython = app.FileExists( pythonFile );

	//Check for transparent app.
	var extraOps = "";
	if( HasOption("transparent") ) {
		if( !premium ) { alert( "Transparent Apps are a Premium feature!" ); return; }
		//else extraOps = "transparent";
	}
	//Check for MUI app.
	if( HasOption("mui") ) {
		if( !premium ) { alert( "Material UI is a Premium feature!" ); return; }
	}
	//Check for Fast mode app.
    if( HasOption("fast") ) {
        if( !premium ) { alert( "Fast mode is a Premium feature!" ); return; }
    }

	//Check for config options.
	if( !HasPkgFile() ) extraOps += (extraOps?",":"") + "holo";

	//Clear the app log.
	if( txtDebug ) txtDebug.Log( "--- "+name+" ---", "Clear" )

	//Start the app.
	var ext = (isPython?".py":(isHtml?".html":".js"))
	if( options ) StartApp( appPath+"/"+name+"/"+name+ext, options+extraOps, intent );
	else StartApp( appPath+"/"+name+"/"+name+ext, g_debugParams+extraOps, intent );
}

//Check if the current project has a particular option set.
function HasOption( option, file )
{
    var ext = (isPython?".py":(isHtml?".html":".js"))
	if( !file ) file = appPath+"/"+curProgram+"/"+curProgram + ext;
	var code = app.ReadFile( file );
	if( code ) {
	    code = code.toLowerCase();
	    if( code.indexOf("cfg."+option)>-1 ) return true;
	}

	//Old way (deprecated) use cfg.* instead.
	var re = /_addoptions\( ?["|'](.*?)["|'] ?\)/g;
	while( match = re.exec(code) ) {
		var ops = match[1].split(",");
		for( i in ops ) {
			if( ops[i].toString()==option ) return true;
		}
	}
	return false;
}

//Check if a ~package.json file is present (>=V2 projects only)
function HasPkgFile()
{
	return app.FileExists( appPath+"/"+curProgram+"/~package.json" )
}

//Handle broadcast msg from user's app (errors etc).
function app_OnBroadcast( type, msg )
{
	if( type=="ShowError" && !isSample && !isWebIDE && !headless )
	{
		//Prevent auto-close of app.
		if( sharedApp ) {
			sharedApp = null;
			layFront.SetVisibility("Show");
		}
		//Get message.
		msg = msg.split("|");
		var error = msg[0];
		var line = parseInt(msg[1])-1;
		var file = msg[2].replace("file://","");
		var fileTitle = file.substr( file.lastIndexOf("/")+1 );

		//Detect errors on app.js (ie. OnStart not defined etc).
		//if(file.indexOf("app.js")>-1 || file.indexOf("nxt.js")>-1
		//	|| file.indexOf("tabs.js")>-1 ) line = -1;

		//Detect errors on non-project files (eg app.js external libs).
		var appFiles = GetFilesList();
		if( !appFiles || !appFiles.find( function(s){return s.indexOf(fileTitle)>-1} ) ) line = -1;

		//Handle service error.
		if( file.indexOf("Service.js")>-1 ) {
			var pid = app.GetData( "PID" );
			if( pid ) app.KillApp( pid );
			app.Alert( error, "Service Error" );
			return;
		}

		//Re-load code.
		var code = null;
		if( line < 0 ) LoadFile( curProgram );
		else LoadFile( curProgram, fileTitle );

		//Highlight current error line and start code completion.
		lastCursorLine = line;
		setTimeout( function(){edit.HighlightLine(lastCursorLine)}, 300 );
		clearInterval( ccTimer );
		ccTimer = setInterval( CheckForCodeSuggestions, 500 );
	}
	else if( type=="!addmodule" )
	{
	    var name = msg.split("|")[0];
	    var yn = app.CreateYesNoDialog( "Install node module: " + name + "?" );
        yn.SetOnTouch( function(res) { if( res=="Yes" ) InstallModule( name ) });
        yn.Show();
	}
	else if( type=="!obfuscate" )  {
        var params = msg.split("|")
        Obfuscate( app.RealPath(params[0]), app.RealPath(params[1]), params[2]?params[2]:"" )
    }
    else if( type=="!export" )  {
        var params = msg.split("|")
        Export( params[0], app.RealPath(params[1]), app.RealPath(params[2]) )
    }
}

//Obfuscate a file.
function Obfuscate( src, dest, options )
{
    options = options.toLowerCase()
    var ext = src.substr( src.lastIndexOf(".") ).toLowerCase();

    LoadApkBuilder()
    var code = app.ReadFile( src );
    if( !options.includes("noswap") ) code = Swapify( code, false );
    if( ext==".js" ) code = Uglify( src, code );
    app.WriteFile( dest, code );
}

//Export a project.
function Export( type, src, dest )
{
    type = type.toLowerCase()
    if( type=="gameview" )
    {
        _Dbg( "Exporting..." )
        app.MakeFolder( dest )
        var html = _WglTemplate( Util.GetFileTitle(src) )
        html = html.replace( RegExp("file:///android_asset","gim"), "Sys" )
        app.WriteFile( dest+"/index.html", html )

        app.ExtractAssets( "/Sys/Libs", dest+"/Sys/Libs", true )
        app.DeleteFile( dest+"/Sys/Libs/JQuery.js" )
        app.DeleteFile( dest+"/Sys/Libs/Numeral.js" )
        app.DeleteFile( dest+"/Sys/Libs/Noise.js" )
        app.DeleteFile( dest+"/Sys/Libs/Flot.js" )
        app.ExtractAssets( "/Sys/Img", dest+"/Sys/Img", true )
        app.ExtractAssets( "/Sys/Snd", dest+"/Sys/Snd", true )

        var srcFldr = app.RealPath(src)
        srcFldr = srcFldr.substr( 0, srcFldr.lastIndexOf("/") )
        var appName = srcFldr.substr( srcFldr.lastIndexOf("/")+1 )

        app.CopyFolder( srcFldr, dest, true )
        app.DeleteFile( dest+"/"+appName+".js" )
        app.DeleteFile( dest+"/~package.json" )

        _Dbg( "Done!" )
    }
}

//Handle notification messages.
function Notify( name, msg )
{
    if( typeof notify=='undefined' ) notify = app.CreateNotification( "AutoCancel,IDE" )
    notify.SetMessage( "New message!", name, msg )
    notify.SetSmallImage( "/Sys/Img/Notify.png" )
	notify.Notify()
}

//Handle program long press.
function lst_OnLongTouch( e )
{
	var img = app.GetLastImage();
	if( img ) img.SetAlpha( 1.0 );

	//Set program name.
	curProgram = e.source.data.name

	//Check for type of app.
    var htmfile = appPath+"/"+curProgram+"/"+curProgram+".html"
    isHtml = app.FileExists( htmfile );
    var pythonFile = appPath+"/"+curProgram+"/"+curProgram+".py"
    isPython = app.FileExists( pythonFile );

	//Show options dialog.
	var sOps = T("Edit")+","+T("Rename")+","+T("Copy")+","+T("Delete")
		+","+T("CreateShortcut")+","+T("ShareSPK")+",GitHub,"+T("SaveSPK")+","+T("BuildAPK")+",Build AAB";
	lstOps = app.CreateListDialog( T("Actions"), sOps, "ShowNow" );
	lstOps.SetOnTouch( lstOps_Select );
}

//Handle file selection.
function lstFiles_OnTouch( item, body, type, pos )
{
	btnFiles_OnTouch();

	//Check premium feature.
	if( pos > 2 && !premium ) {
		alert( "Please upgrade to 'DroidScript Premium' to edit more than 3 files" );
		return;
	}

	if( layEdit.IsVisible() ) SaveFile();
	LoadFile( curProgram, item );
}

//Handle file options.
function lstFiles_OnLongTouch( item )
{
	//Show options dialog.
	var sOps = T("Delete");
	lstOps = app.CreateListDialog( T("Actions"), sOps, "ShowNow" );
	lstOps.SetOnTouch( lstFileOps_Select );
	curLongTouchFile = item;
}

//Handle file option selection.
function lstFileOps_Select( item )
{
	if( item==T("Delete") )
	   app.DeleteFile( appPath+"/"+curProgram+"/"+ curLongTouchFile );

	//Refresh files list.
	lstFiles.SetList( GetFilesList() );

	if( curLongTouchFile==curFileTitle )
		LoadFile( curProgram );
}

//Save user's changes if dirty flag set.
function SaveFile()
{
	if( dirty )
	{
		var txt = edit.GetText();
		txt = txt.replace( RegExp( "\u00A0","gim"), " " ); //Replace nbsp with normal space.
		app.WriteFile( appPath+"/"+curProgram+"/"+ curFileTitle, txt );
		dirty = false;
	}
	lastCursorPos[curFileTitle] = edit.GetCursorPos();
}

//Load a file to editor.
function LoadFile( progName, file )
{
    SetCurProg( progName )

	//If no file name specified.
	if( !file )
	{
		//Check for type of app.
		var htmfile = appPath+"/"+progName+"/"+progName+".html"
		isHtml = app.FileExists( htmfile ) ;
        var pyFile = appPath+"/"+progName+"/"+progName+".py"
        isPython = app.FileExists( pyFile );

		//Check for Espruino app.
		if( app.FileExists( appPath+"/"+progName+"/.espruino" ) ) {
			btnDbg.SetText( "[fa-desktop]" );
			btnNew.Gone(); btnAsset.Gone();
			isEspruino = true;
		}
		else {
			btnDbg.SetText( noIcons?"Debug":"[fa-bug]" );
			btnNew.Show(); btnAsset.Show();
			isEspruino = false;
		}

		//Set file name.
		file = progName + (isPython?".py":(isHtml?".html":".js"));
		curProgTitle = file;
	}

	//Load code.
	var txt = app.ReadFile( appPath+"/"+progName+"/"+file );
	curFileTitle = file;

	//Load code and show file selector.
	edit.SetHtml( txt );
	edit.Focus();

	//Set editor language
	var ext = file.substr( file.lastIndexOf(".") ).toLowerCase();
	edit.SetLanguage( ext );

	//Show current files list.
	btnFiles.SetText( curFileTitle );
	lstFiles.SetList( GetFilesList() );
	if( !v3 ) btnFiles.Show();

	//Clear history if program has changed.
	if( lastProg!=file ) edit.ClearHistory();
	lastProg = file;

	//Reset cursor position.
	edit.SetCursorPos( lastCursorPos[curFileTitle] );
	clearInterval(ccTimer);
	ccTimer = setInterval( CheckForCodeSuggestions, 500 );

	if( !layEdit.IsVisible() )
	{
		//Animate flip and start change watch timer.
		layFlip.Animate( "Flip", null, 350  );
		timer = setTimeout( function(){CheckForChanges()}, 1000 );

		//Show info bar and start code completion.
		setTimeout( function(){layInfo.SetVisibility('Show')}, 250 );
		setTimeout( function(){ResizeCodingMenus()}, 300 );
		setTimeout( function(){LoadMenus(true)}, 350 );
		clearInterval( ccTimer );
		ccTimer = setInterval( CheckForCodeSuggestions, 500 );
	}
}


//Called when program long click option chosen.
function lstOps_Select( item, noSetCols )
{
	if( item==T("Edit") )
	{
		LoadFile( curProgram );
		if( tipCount++ < 4 ) app.ShowPopup( T("TapYoyo"), "long" );
	}
	else if( item==T("Rename") ) {
		ShowTextDialog( T("RenameApp"), curProgram, null, "OnRename" );
	}
	else if( item==T("Copy") ) {
		ShowTextDialog( T("CopyApp"), curProgram+" Copy", null, "OnCopy" );
	}
	else if( item==T("Delete") )
	{
		yesNo = app.CreateYesNoDialog( T("DeleteSure") + " '" + curProgram + "' ?" );
		yesNo.SetOnTouch( yesNoDelete_OnTouch );
		yesNo.Show();
	}
	else if( item==T("CreateShortcut") )
	{
		var file = appPath+"/"+curProgram+"/"+curProgram+".js";
		var iconFile = appPath+"/"+curProgram+"/Img/"+curProgram+".png";
		if( !app.FileExists( iconFile ) ) iconFile = "/assets/Img/Icon.png";

		//Check type of app.
		var scanFile = file;
		var htmlFile = file.replace(".js",".html");
		if( app.FileExists( htmlFile ) ) scanFile = htmlFile;
		var blocksFile = file.replace(".js",".dsj.js");
		if( app.FileExists( blocksFile ) ) scanFile = file = blocksFile;
        var pythonFile = file.replace(".js",".py");
        if( app.FileExists( pythonFile ) ) scanFile = pythonFile;

		options = "";
		ScanFile( scanFile, true );

		if( !HasPkgFile() ) options += ((options?",":"") );
		app.CreateShortcut( curProgram, iconFile, scanFile, options );
		setTimeout( ()=>{
		    var scuts = JSON.stringify(app.GetShortcuts());
		    if( scuts.includes(curProgram) ) app.ShowPopup( "Shortcut created on home screen!" )
		    else app.Alert( "Shortcut permission denied!  Please enable it in the Android settings.", "Error" )
        }, 2000 )
	}
	else if( item==T("ShareSPK") )
	{
		var file = CreatePackage( curProgram, tempFldr );
		app.SendFile( file, curProgram.replaceAll(" ","_")+".spk",
		    "Check out my awesome DroidScript App!\n\nwww.droidscript.org", "Share SPK" );
	}
	else if( item==T("SaveSPK") ) {
		SaveSPK();
	}
	else if( item==T("BuildAPK") )
	{
		var privDir = app.GetPrivateFolder( "Plugins" );
		var plgFile = privDir+"/apkbuilder/ApkBuilder.jar";
		if( app.FileExists(plgFile) && ( purchases["plugin_apkbuilder"] || premium ) )
			ShowBuildDialog();
		else
			app.Alert( T("APKPluginRequired"), T("BuildAPK"), "", "#bb000000" );
	}
	else if( item=="Build AAB" )
	{
		var privDir = app.GetPrivateFolder( "Plugins" );
		var plgFile = privDir+"/apkbuilder/ApkBuilder.jar";
		if( app.FileExists(plgFile) && premium )
			ShowBuildDialog( true );
		else
			app.Alert( T("APKPluginRequired"), "Build AAB", "", "#bb000000" );
	}
	else if( item=="GitHub" )
	{
	    if( !premium ) {
	        alert( "Please upgrade to 'DroidScript Premium' to use GitHub" );
	        return;
	    }
	    if( !personalAccessToken.startsWith("ghp_") )
	    {
	        var steps = "Git Personal Access Token required!\n\n" +
	        "To create one, go to github.com and follow these steps:\n\n" +
	        "1- In the upper-right corner of any page, click your profile photo, then click Settings.\n" +
	        "2- In the left sidebar, click <> Developer settings.\n" +
	        "3- In the left sidebar, click Personal access tokens.\n" +
	        "4- Click Generate new token.\n" +
	        "5- Give your token a descriptive name (You can name it as DroidScript).\n" +
	        "6- To give your token an expiration, select the Expiration drop-down menu.\n" +
	        "7- Select the scopes repo and user:email.\n" +
	        "8- Click Generate token.\n\n" +
	        "Paste your token into the DroidScript menu/settings page.";

	        app.Alert(steps, "Git");
	        return;
	    }

	    // If a dialog is already opened, don't recreate it, update the git content in the opened dialog.
	    if( typeof ghDlg !== "undefined" && ghDlg.activeProgram === curProgram ) {
	        ghWeb.Execute("refreshDatas()");
	        return ghDlg.Show();
        }

	    ghDlg = app.CreateDialog();

	    ghWeb = app.CreateWebView(isPortrait ? 1 : 1, 1, "Progress");
	    ghWeb.LoadUrl(app.GetPath() + "/Extensions/GitHub/Left/ds_app.html?appName=" + curProgram);
	    ghWeb.SetBackColor("#2e3134");
	    ghWeb.SetOnProgress(function( val ) {
	        if( val === 100 ) {
	            ghDlg.activeProgram = curProgram;
	        }
	    })
	    ghDlg.AddLayout(ghWeb);

	    ghDlg.Show();
	}
}

//Handle delete 'are you sure' dialog.
function yesNoDelete_OnTouch( result )
{
	if( result=="Yes" ) {
		//Delete the file and refresh list.
		app.DeleteFolder( appPath+"/" + curProgram );
		//lst.SetList( GetProgramList(), "," );
		ShowIcons();
	}
}

//Called after user enters renamed program.
function OnRename( name )
{
	//Check if already exists.
	var fldr = appPath+"/"+name;
	if( app.FolderExists( fldr ) ) {
		app.Alert( "App already exists!" );
	}
	else {
		//Rename the main file.
		var ext = (isPython?".py":(isHtml?".html":".js"))
		var oldfile = appPath+"/"+curProgram+"/"+curProgram+ext;
		var newfile = appPath+"/"+curProgram +"/"+name+ext;
		if( app.FileExists( oldfile ) ) app.RenameFile( oldfile, newfile );

		//Rename folder and refresh list.
		app.RenameFolder( appPath+"/"+curProgram, appPath+"/"+name );
		ShowIcons( true );
	}
}

//Called after user enters copied program.
function OnCopy( name )
{
	//Check if already exists.
	var fldr = appPath+"/"+name;
	if( app.FolderExists( fldr ) ) {
		app.Alert( "App already exists!" );
	}
	else {
		//Copy folder.
		app.CopyFolder( appPath+"/"+curProgram, appPath+"/"+name );

		//Rename the .js file.
		var oldfile = appPath+"/"+name+"/"+curProgram+".js";
		var newfile = appPath+"/"+name +"/"+name+".js";
		if( app.FileExists( oldfile ) ) app.RenameFile( oldfile, newfile );

		//Rename the .html file.
		oldfile = appPath+"/"+name+"/"+curProgram+".html";
		newfile = appPath+"/"+name +"/"+name+".html";
		if( app.FileExists( oldfile ) ) app.RenameFile( oldfile, newfile );

		//Refresh list.
		ShowIcons();
	}
}

//Called after user enters new program name.
function OnAdd( name, type, tmplt )
{
	//Check up name.
	if( !isValidAppName(name) ) {
		alert( "Name contains invalid characters or is a reserved word!" );
		ShowTextDialog( T("NewApp"), "", "Native,Node,HTML,Hybrid,Python", "OnAdd", templates );
		return;
	}
	//Check for premium templates.
	if( tmplt.indexOf("◆")>-1 && !premium ) {
		app.ShowPopup( "Please upgrade to 'DroidScript Premium' to use this template" );
		return;
	}

	var fldr = appPath+"/"+name;
	if( app.FolderExists( fldr ) ) {
		app.Alert( "App already exists!" );
	}
	else {
		app.MakeFolder( fldr );

		if( type.toLowerCase()=="html" ) {
			var prog = app.ReadFile( "/Sys/Html/Template.html" );
			app.WriteFile( fldr+"/"+name+".html", prog );
		}
		else {
			var prog = "";
			var ext = (type=='Python'?".py":".js")
            app.ExtractAssets( "templates/"+type.toLowerCase()+"/"+tmplt, fldr, true );
            app.DeleteFile( fldr+"/"+tmplt+ext  );
            prog = app.ReadFile( "/Sys/templates/"+type.toLowerCase()+"/"+tmplt+"/"+tmplt+ext );
			app.WriteFile( fldr+"/"+name+ext, prog );
		}

		//Refresh list.
		ShowIcons();
	}
}

//Check for valid file names.
function isValidFileName(str)
{
	return !/[`!#$%\^&*+=\[\]\\';,/{}|\\":<>\?]/g.test(str);
}

//Check for valid app names.
function isValidAppName( name )
{
    if( name.toLowerCase()=="service" ) return false
    else if( name.toLowerCase()=="job" ) return false
	else return isValidFileName( name )
}

//Handle code changes.
function edit_OnChange()
{
	textChanged = true;
	dirty = true;
	edit.HighlightLine( -1 );
}

//Handle special key combos (physical keyboard).
function edit_OnKey( state, name, code, mods )
{
	//console.log( state + " " + name + " " + mods );
	var ctrl = mods.indexOf("Ctrl")>-1;
	var shift = mods.indexOf("Shift")>-1;

	if( state=="Up" && ctrl )
	{
		if( name=="F" || name=="H" )
		{
			srchBtn_OnTouchDown();
			edtSrch.Focus();
			var txt = edit.GetSelectedText();
			if( txt ) edtSrch.SetText( txt );
		}
		if( name=="K" )
		{
			var txt = edit.GetSelectedText();
			edit.Search( txt, shift ? "Back" : "Forward" );
		}
		else if( name=="I" ) {
			infoBtn_OnTouchDown();
			lstCC.Focus();
		}
		else if( name=="S" ) SaveFile();
		else if( name=="SPACE" ) btnExec_OnTouch();

		else if( name=="O" )
		{
			btnFiles_OnTouch();
			lstFiles.Focus();
		}
	}
}


//Check for change in current line posn.
function CheckForChanges()
{
	if( textChanged ) {
		var line = edit.GetCursorLine();
		if( lastLine != line ) SetEditorColours();
		lastLine = line;
	}
}

//Do syntax highlighting in editor.
function SetEditorColours()
{
	return; //xx
	var txt = edit.GetText();
	txt = SetColours( txt );
	edit.SetHtml( txt );
	textChanged = false;
}

//Do syntax highlighting on a string.
//(also replace newlines with page breaks etc)
function SetColours( txt, isHtml )
{
	return txt; //xx

	txt = txt.replace( RegExp( "&","gim"), "&amp;" );
	txt = txt.replace( RegExp( "<","gim"), "&lt;" );
	txt = txt.replace( RegExp( ">","gim"), "&gt;" );
	txt = txt.replace( RegExp( " ","gim"), "&nbsp;" );
	//txt = txt.replace( RegExp("(//.*?)$","gim"), "<font face='Arial' color='#008800'>$1</font>" );
	txt = txt.replace( RegExp("(^|;|\\s)(//.*?)$","gim"), "$1<font face='Arial' color='#008800'>$2</font>" );

	txt = txt.replace( RegExp("(&lt;html&gt;)","gim"), "<font face='Arial' color='#0000aa'>$1</font>" );
	txt = txt.replace( RegExp("(&lt;/html&gt;)","gim"), "<font face='Arial' color='#0000aa'>$1</font>" );
	txt = txt.replace( RegExp("(&lt;head&gt;)","gim"), "<font face='Arial' color='#0000aa'>$1</font>" );
	txt = txt.replace( RegExp("(&lt;/head&gt;)","gim"), "<font face='Arial' color='#0000aa'>$1</font>" );
	 txt = txt.replace( RegExp("(&lt;style&gt;)","gim"), "<font face='Arial' color='#0000aa'>$1</font>" );
	txt = txt.replace( RegExp("(&lt;/style&gt;)","gim"), "<font face='Arial' color='#0000aa'>$1</font>" );
	txt = txt.replace( RegExp("(&lt;body.*?&gt;)","gim"), "<font face='Arial' color='#0000aa'>$1</font>" );
	txt = txt.replace( RegExp("(&lt;/body&gt;)","gim"), "<font face='Arial' color='#0000aa'>$1</font>" );
	txt = txt.replace( RegExp("(&lt;script.*?&gt;)","gim"), "<font face='Arial' color='#0000aa'>$1</font>" );
	txt = txt.replace( RegExp("(&lt;/script&gt;)","gim"), "<font face='Arial' color='#0000aa'>$1</font>" );
	txt = txt.replace( RegExp("(&lt;meta.*?&gt;)","gim"), "<font face='Arial' color='#0000aa'>$1</font>" );

	txt = txt.replace( RegExp( "\\n","gim"), "<br>" );
	return txt;
}

//Handle run button during code edit.
function btnExec_OnTouch()
{
	//Save user's changes.
	SaveFile();

	//Execute sample program in it's own process.
	isSample = false;
	isWebIDE = false;
	LaunchApp( curProgram, "", "debug,remote" );
}

//Handle debug button during code edit.
function btnDbg_OnTouch()
{
	if( isEspruino)
	{
		_LoadScriptSync( "/Sys/esp.js" )
		_LoadScriptSync( "/Sys/term.js" )
		if( !espruino ) espruino = new Espruino();
		if( !term ) term = new Terminal( espruino );

		term.Toggle();
		espruino.Connect();
		return;
	}

	//Save user's changes.
	SaveFile();

	//Execute program in it's own process.
	isSample = false;
	isWebIDE = false;
	LaunchApp( curProgram, "", "debug,overlay" );
}

//Handle undo key.
function btnUndo_OnTouch()
{
	edit.Undo();
}

//Handle redo key.
function btnRedo_OnTouch()
{
	edit.Redo();
}

//Handle assets key.
function btnAsset_OnTouch()
{
	ShowAssetsDialog();
}

//Handle new file button
function btnNew_OnTouch()
{
	//Check premium feature.
	var numFiles = GetFilesList().length;
	if( numFiles > 2 && !premium ) {
		alert( "Please upgrade to 'DroidScript Premium' to edit more than 3 files" );
		return;
	}
	ShowTextDialog( "New File", "", "Script,Class,Text,HTML,CSS,JSON,Python", "OnNew" );
}

//Called after user chooses to create a new file.
function OnNew( name, type )
{
	//Check up name.
	if( !isValidFileName(name) ) {
		alert( "Name contains invalid characters!" );
		ShowTextDialog( "New File", "", "Script,Class,Text,HTML,CSS,JSON,Python", "OnNew" );
		return;
	}

	//Build file name.
	type = type.toLowerCase();
	if( name.indexOf(".")==-1 ) name = name+"."+type;
	name = name.replace(".script",".js");
	name = name.replace(".class",".js");
	name = name.replace(".text",".txt");
	name = name.replace(".python",".py");

	//Create new file.
	var file = appPath+"/"+curProgram+"/"+name;
	if( app.FileExists( file ) )
		app.Alert( "File already exists!" );
	else {
		var prog = "";
		if( type=="html" ) prog = app.ReadFile( "/Sys/Html/Template.html" );
		else if( type=="class" ) prog = app.ReadFile( "/Sys/templates/Native/Class.js" );
		else if( type=="json" ) prog = "{\n\n}";
		else if( type=="css" ) prog = "body\n{\n\n}";
		else if( type=="python" ) prog = "from droidscript import app, ui\n\nprint('Hello World!')";
		app.WriteFile( file, prog );
	}
	//Refresh files list.
	lstFiles.SetList( GetFilesList() );

	SaveFile();
	LoadFile( curProgram, name );
}

//Handle Left panel button press.
function btnLeft_OnTouch()
{
	app.Vibrate( "0,10" );
	app.HideKeyboard( true );

	if( layRight.IsVisible()  )  {
		layRight.Animate( "SlideToRight", OnDoneAnimate );
		btnRight.SetText( noIcons?"Right Drawer":"<<" );
	}

	if( !layLeft.IsVisible()  ) {
		layLeft.Animate( "SlideFromLeft", OnDoneAnimate );
		btnLeft.SetText( "<<" );
		SetMenus( "Exit:Exit.png", "/assets/Img" );
		HideCodingMenus();
		if( btnFiles.IsVisible() ) btnFiles.Hide();
		if( layFile.IsVisible() ) layFile.Hide();
	}
	else {
		layLeft.Animate( "SlideToLeft", OnDoneAnimate );
		btnLeft.SetText( noIcons?"Left Drawer":">>" );
		SetMenus( "New:Add.png,Connect:Connect.png,Exit:Exit.png", "/assets/Img" );
		edit.Focus();

		//Show info bar and start code completion if editing.
		if( layEdit.GetVisibility()=="Show" ) {
			setTimeout( function(){layInfo.SetVisibility('Show')}, 250 );
			clearInterval( ccTimer );
			ccTimer = setInterval( CheckForCodeSuggestions, 500 );
			if( !v3 ) btnFiles.Show();
		}
	}
}

//Handle Samples button press.
function btnRight_OnTouch()
{
	app.Vibrate( "0,10" );
	app.HideKeyboard( true );

	if( layLeft.IsVisible() ) {
		layLeft.Animate( "SlideToLeft", OnDoneAnimate );
		btnLeft.SetText( noIcons?"Left Drawer":">>" );
	}

	if( !layRight.IsVisible() )
	{
		layRight.Animate( "SlideFromRight", OnDoneAnimate );
		btnRight.SetText( ">>" );
		SetMenus( "Exit:Exit.png", "/assets/Img" );
		HideCodingMenus();
		if( false ) editSamp.Focus();
		else tabsRight_OnChange( "[fa-rocket]" )
		if( btnFiles.IsVisible() ) btnFiles.Hide();
		if( layFile.IsVisible() ) layFile.Hide();
		//webChat.Execute( "ext_OnSelect('Chat')" )
	}
	else {
		layRight.Animate( "SlideToRight", OnDoneAnimate );
		btnRight.SetText( noIcons?"Right Drawer":"<<" );
		SetMenus( "New:Add.png,Connect:Connect.png,Exit:Exit.png", "/assets/Img" );
		edit.Focus();
		//webChat.Execute( "ext_OnDeselect('*')" )

		//Show info bar and start code completion if editing.
		if( layEdit.GetVisibility()=="Show" )
		{
			setTimeout( function(){layInfo.SetVisibility('Show')}, 250 );
			clearInterval( ccTimer );
			ccTimer = setInterval( CheckForCodeSuggestions, 500 );
			if( !v3 ) btnFiles.Show();
		}
		else if( layCopy.GetVisibility()=="Show" )
			layCopy.Animate( "SlideToRight" );
	}
}

//Called when animation is finished.
function OnDoneAnimate( type )
{
	if( layEdit.IsVisible() )
		if( layCopy.IsVisible() )
			 edit_OnDoubleTap( true );

    if( v3 && webProject.data.changed ) tabsLeft_OnChange( "[fa-sitemap]" )
}

//Called when samples list item is selected.
function lstSamp_OnTouch( item, body, type )
{
	//Get item name and type.
	curSample = item.split(":")[0];
	curSampType = type;

	//Check for premium samples.
	if( curSample.indexOf("&#9830;")>-1 ) {
		app.ShowPopup( "Please upgrade to 'DroidScript Premium' to access this sample" );
		return;
	}

	//Remote IOIO bit on front.
	curSample = curSample.replace( RegExp( "IOIO ","gim"), "" );

	//Replace spaces with underscores (for ICS assets).
	curSample = curSample.replace( RegExp( " ","gim"), "_" );

	//Load sample code.
	sampPath = "/assets/samples/";
	if( app.GetAppLangCode() != "en" ) sampPath = docsPath + "/samples/";
	sampFile = sampPath + curSample + (curSampType=="x"?".js":".html");
	if( !app.FileExists(sampFile) ) sampFile = "/assets/samples/" + curSample + (curSampType=="x"?".js":".html");
	sampCode = app.ReadFile( sampFile );
	sampCode = SetColours( sampCode, curSampType=="h" );
	editSamp.SetText( sampCode );

	layEditSamp.SetVisibility( "Show" );
	editSamp.Focus();

	if( tipCount++ < 4 ) app.ShowPopup( "Press Back to return to list", "Short" );
}

//Called when samples list item is long pressed.
function lstSamp_OnLongTouch( item )
{
}

//Handle running of samples.
function btnRun_OnTouch()
{
	//Execute sample program in it's own process.
	isSample = true;
	StartApp( sampFile, "debug,remote" );
}

//Handle copy of samples.
function btnCopy_OnTouch()
{
	app.SetClipboardText( editSamp.GetText() );
	app.ShowPopup( "Sample copied to clipboard" );
}

//Handle code zoom in button.
function btnZoomIn_OnTouch()
{
	if( textSize <= 18 ) textSize += 2;
	editSamp.SetTextSize( textSize );
}

//Handle code zoom out button.
function btnZoomOut_OnTouch()
{
	if( textSize >= 10 ) textSize -= 2;
	editSamp.SetTextSize( textSize );
}

//Show the settings dialog.
function ShowSettings()
{
	//Create dialog window.
	dlgSet = app.CreateDialog( T("Settings") );
	dlgSet.SetBackColor( "#2E3134" );

	//Create a scroller and layout.
	var scrollSet = app.CreateScroller();
	dlgSet.AddLayout( scrollSet );
	laySet = app.CreateLayout( "linear", "vertical,Center,FillXY" );
	scrollSet.SetPadding( 0.04,0,0.04,0 )
	//if( orient=="Portrait" ) laySet.SetSize( 0.85, 0.8 );
	//else laySet.SetSize( 0.6, 0.92 );
	scrollSet.AddChild( laySet );
	//laySet.SetPadding( 0.2, 0.02, 0.2, 0.02 );

	//Create device name edit box.
	edtSetName = app.CreateTextEdit( deviceName, 0.4 );
	//edtSetName.SetMargins( 0.1, 0, 0.1, 0 );
	edtSetName.SetHint( T("DeviceName") );
	laySet.AddChild( edtSetName );

	//Create language spinner.
	laySet2 = app.CreateLayout( "linear", "horizontal,center" );
	laySet.AddChild( laySet2 );
	spinLang = app.CreateSpinner( "English,Deutsch,Español,Français,Italiano,Português,Русский", 0.4 );
	spinLang.SelectItem( language );
	spinLang.SetMargins( 0, 0.02, 0, 0 );
	spinLang.SetOnChange( spinLang_OnChange );
	if( true ) spinLang.Gone()
	laySet2.AddChild( spinLang );

	//Create text size spinner.
	laySet2a = app.CreateLayout( "linear", "vertical,Vcenter" );
	txtSet = app.CreateText( T("FontSize"), 0.2 );
	txtSet.SetMargins( 0, 0.01, 0, 0 );
	laySet2a.AddChild( txtSet );
	spTextSize = app.CreateSpinner( "6,7,8,9,10,11,12,13,14,15,16,18" );
	//spTextSize.SetSize( 0.3, -1 );
	spTextSize.SetText( textSize );
	laySet2a.AddChild( spTextSize );
	laySet2.AddChild( laySet2a );

	//Create horizontal layout.
	var layHoriz = app.CreateLayout( "linear", "horizontal,center" );
	laySet.AddChild( layHoriz );

	//Create ADB checkbox.
	chkSetAdb = app.CreateCheckBox( T("Use")+" ADB" );
	//chkSetAdb.SetMargins( 0, 0.04, 0, 0 );
	layHoriz.AddChild( chkSetAdb );
	chkSetAdb.SetChecked( useADB );

	//Create No Icons checkbox.
	chkNoIcons = app.CreateCheckBox( "No Icons" );
	chkNoIcons.SetMargins( 0.12, 0, 0, 0 );
	chkNoIcons.SetChecked( noIcons );
	chkNoIcons.SetOnTouch( function(){app.ShowPopup("Please restart DroidScript to see effect")} )
	layHoriz.AddChild( chkNoIcons );

	//Create horizontal layout.
	var layHoriz = app.CreateLayout( "linear", "horizontal,center" );
	laySet.AddChild( layHoriz );

	//Create Use SoftKeys checkbox.
	chkSetSoftKeys = app.CreateCheckBox( T("Use")+" SoftKeys" );
	chkSetSoftKeys.SetMargins( 0, 0.02, 0, 0 );
	chkSetSoftKeys.SetChecked( useSoftKeys );
	layHoriz.AddChild( chkSetSoftKeys );

	//Create Use Yoyo checkbox.
	chkSetYoyo = app.CreateCheckBox( T("Use")+" Yoyo" );
	chkSetYoyo.SetMargins( 0.04, 0.02, 0, 0 );
	chkSetYoyo.SetChecked( useYoyo );
	layHoriz.AddChild( chkSetYoyo );

	//Create horizontal layout.
	var layHoriz = app.CreateLayout( "linear", "horizontal,center" );
	laySet.AddChild( layHoriz );

	//Create Stay Awake checkbox.
	chkStayAwake = app.CreateCheckBox( T("StayAwake") );
	chkStayAwake.SetMargins( 0, 0.02, 0, 0 );
	chkStayAwake.SetChecked( stayAwake );
	layHoriz.AddChild( chkStayAwake );

	//Create Auto-help checkbox.
	chkAutoHelp = app.CreateCheckBox( "Auto-Help" );
	chkAutoHelp.SetMargins( 0.06, 0.02, 0, 0 );
	chkAutoHelp.SetChecked( autoHelp );
	layHoriz.AddChild( chkAutoHelp );

	//Create horizontal layout.
	var layHoriz = app.CreateLayout( "linear", "horizontal,center" );
	laySet.AddChild( layHoriz );

	//Create Use DarkTheme checkbox.
	chkSetDarkTheme = app.CreateCheckBox( T("DarkTheme") );
	chkSetDarkTheme.SetMargins( 0, 0.02, 0, 0 );
	chkSetDarkTheme.SetChecked( useDarkTheme );
	layHoriz.AddChild( chkSetDarkTheme );

	//Create Auto-wifi checkbox.
	chkAutoWifi = app.CreateCheckBox( "Auto-Wifi" );
	chkAutoWifi.SetMargins( 0.05, 0.02, 0, 0 );
	chkAutoWifi.SetChecked( autoWifi );
	layHoriz.AddChild( chkAutoWifi );

	//Create run from background checkbox.
    chkAllowBackRun = app.AddCheckBox( laySet, "Allow Background Launch" );
    chkAllowBackRun.SetMargins( 0, 0.01, 0, 0 );
    chkAllowBackRun.SetChecked( allowBackRun );
    if( !premium ) chkAllowBackRun.Gone()

	//Create horizontal layout.
	var layHoriz = app.CreateLayout( "linear", "horizontal,center,vcenter" );
	laySet.AddChild( layHoriz );

	//Create Password checkbox.
	chkSetPass = app.CreateCheckBox( T("Use")+" "+T("Password" ) );
	chkSetPass.SetMargins( 0, 0.01, 0, 0 );
	layHoriz.AddChild( chkSetPass );
	chkSetPass.SetChecked( usePass );

	//Create password edit box.
	edtSetPass = app.CreateTextEdit( password, 0.25 );
	edtSetPass.SetMargins( 0.02,0.01,0,0.01 )
	edtSetPass.SetHint( "Password" );
	layHoriz.AddChild( edtSetPass );

    //Create cloud key edit box.
   	edtCloudKey = app.CreateTextEdit( cloudKey, 0.6 );
   	edtCloudKey.SetMargins( 0, 0.01, 0, 0 )
   	edtCloudKey.SetHint( "Cloud Key" );
   	laySet.AddChild( edtCloudKey );

	//Create github personal access token edit box.
    var hiddenPAT = personalAccessToken ? personalAccessToken.slice(0, 9) + "..." : "";
    edtPAT = app.CreateTextEdit( hiddenPAT, 0.6 );
    edtPAT.SetMargins( 0, 0.01, 0, 0 );
    edtPAT.SetHint( "GitHub Access Token" );
    laySet.AddChild( edtPAT );

	//Create OK and Cancel buttons.
	laySet3 = app.CreateLayout( "linear", "horizontal,fillxy,center" );
	laySet3.SetMargins( 0, 0.03, 0, 0.01 );
	btnSetOK = app.CreateButton( "OK", 0.24 );
	btnSetOK.SetOnTouch( btnSetOK_OnTouch );
	laySet3.AddChild( btnSetOK );
	btnSetCancel = app.CreateButton( "Cancel", 0.24 );
	btnSetCancel.SetOnTouch( btnSetCancel_OnTouch );
	laySet3.AddChild( btnSetCancel );
	laySet.AddChild( laySet3 );

	//Show dialog.
	dlgSet.Show();
}

//Handle settings 'OK' click.
function btnSetOK_OnTouch()
{
	//Save settings.
	deviceName = edtSetName.GetText();
	app.SaveText( "DeviceName", deviceName );

    if( false ) {
        var oldLang = language;
        language = spinLang.GetText();
        app.SaveText( "Language", language );
        SetLanguage( oldLang!=language );
	}

	textSize = parseInt(spTextSize.GetText());
	app.SaveNumber( "TextSize", textSize );
	edit.SetTextSize( textSize );
	//if( !v3 ) editSamp.SetTextSize( textSize );

	useADB = chkSetAdb.GetChecked();
	app.SaveBoolean( "UseADB", useADB );

	noIcons = chkNoIcons.GetChecked();
	app.SaveBoolean( "NoIcons", noIcons );

	useSoftKeys = chkSetSoftKeys.GetChecked();
	app.SaveBoolean( "UseSoftKeys", useSoftKeys );
	edit.SetUseKeyboard( useSoftKeys );

	useYoyo = chkSetYoyo.GetChecked();
	app.SaveBoolean( "UseYoyo", useYoyo );
	edit.SetNavigationMethod( useYoyo ? "Yoyo" : "Touch" );
	//if( !v3 ) editSamp.SetNavigationMethod( useYoyo ? "Yoyo" : "Touch" );

	autoHelp = chkAutoHelp.GetChecked();
	app.SaveBoolean( "AutoHelp", autoHelp );

	stayAwake = chkStayAwake.GetChecked();
	app.SaveBoolean( "StayAwake", stayAwake );
	if( stayAwake ) app.PreventScreenLock( "Full" );
	else app.PreventScreenLock( "None" );


	var dark = chkSetDarkTheme.GetChecked();
	var themChange = (dark != useDarkTheme);
	useDarkTheme = dark;
	app.SaveBoolean( "UseDarkTheme", useDarkTheme );

	edit.SetColorScheme( useDarkTheme ? "Dark" : "Light" );
	//if( !v3 ) editSamp.SetColorScheme( useDarkTheme ? "Dark" : "Light" );
	layLst.SetBackground( useDarkTheme ? "/assets/ide/android_dark.png" : "/assets/ide/android.png" );
	CreateSamplesList();

	//webStore.LoadUrl( storeUrl + "?type=spk&app=1&theme=" + (useDarkTheme?"dark" :"light") );
	//webStore.SetBackColor(useDarkTheme ? "#283036" : "#fefefe");

	autoWifi = chkAutoWifi.GetChecked();
	app.SaveBoolean( "_AutoWifi", autoWifi, "spremote" );

	allowBackRun = chkAllowBackRun.GetChecked();
    app.SaveBoolean( "AllowBackRun", allowBackRun );
    if( allowBackRun ) EnableOverlay();

	usePass = chkSetPass.GetChecked();
	app.SaveBoolean( "UsePass", usePass );
	password = edtSetPass.GetText();
	app.SaveText( "Password", password );

    cloudKey = edtCloudKey.GetText();
    app.SaveText( "CloudKey", cloudKey );

	if(!edtPAT.GetText().endsWith("...")) {
	    personalAccessToken = edtPAT.GetText();
	    app.SaveText( "PersonalAccessToken", personalAccessToken );
	}

	//Remove dialog and relist apps.
	dlgSet.Dismiss();
	if( themChange ) ShowIcons( true );
}

//Handle settings 'Cancel' click.
function btnSetCancel_OnTouch()
{
	dlgSet.Dismiss();
}

//Handle language spinner.
function spinLang_OnChange()
{
	var lang = spinLang.GetText();
	if( lang=="English" ) return;

	//Check if language already installed.
	var code = "-" + app.GetAppLangCode( lang );
	if(code == "-en") code = "";
	docsPath = appPath + "/.edit/docs" + code;
	if( app.FolderExists(docsPath) && !app.IsNewVersion() ) return;

	//Download language plugin if required.
	var plugName = lang.toLowerCase()+"-lang";
	//plugName = "español-lang";
	InstallPlugin( plugName );
}

//Generic text input dialog function.
function ShowTextDialog( title, deflt, choice, callback, choice2 )
{
	_dlgTxt = this;
	this.callback = callback;
	this.choice = choice;
	this.choice2 = choice2;

	//Create dialog window.
	dlgTxt = app.CreateDialog( title );
	dlgTxt.SetBackColor( "#2E3134" );
	layTxtDlg = app.CreateLayout( "linear", "vertical,fillxy" );
	layTxtDlg.SetPadding( 0.04, 0.02, 0.04, 0 );

	//Create dialog controls.
	txtTxtDlg = app.CreateTextEdit( deflt, 0.6, -1, "Left,SingleLine" );
	//txtTxtDlg.SetBackColor( "#ffffffff" );
	layTxtDlg.AddChild( txtTxtDlg );

	if( choice ) {
		spinTxt = app.CreateSpinner( choice, 0.6 );
		spinTxt.SetMargins( 0, 0.02, 0, 0.01 );
		if( choice2 ) spinTxt.SetOnChange( function(item){spinTxt2.SetList(choice2[item])})
		layTxtDlg.AddChild( spinTxt );
	}
	if( choice2 ) {
		spinTxt2 = app.CreateSpinner( choice2["Native"], 0.6 );
		spinTxt2.SetMargins( 0, 0.02, 0, 0.01 );
		layTxtDlg.AddChild( spinTxt2 );
		setTimeout( function(){txtTxtDlg.Focus();app.ShowKeyboard(txtTxtDlg)},100 ) //<--For A9 spin clip bug
	}
	layTxtDlg2 = app.CreateLayout( "linear", "horizontal,fillxy,center" );
	layTxtDlg2.SetMargins( 0, 0.02, 0, 0.01 );
	btnTxtOK = app.CreateButton( "OK", 0.24, -1, "" );
	btnTxtOK.SetOnTouch( _dlgTxt_OnOk );
	layTxtDlg2.AddChild( btnTxtOK );
	btnTxtCancel = app.CreateButton( "Cancel", 0.24, -1, "" );
	btnTxtCancel.SetOnTouch( _dlgTxt_OnCancel );
	layTxtDlg2.AddChild( btnTxtCancel );
	layTxtDlg.AddChild( layTxtDlg2 );

	//Add dialog layout and show dialog.
	dlgTxt.AddLayout( layTxtDlg );
	dlgTxt.Show();
}

function _dlgTxt_OnCancel() { dlgTxt.Dismiss(); }

function _dlgTxt_OnOk()
{
	dlgTxt.Dismiss();
	var txt = txtTxtDlg.GetText();
	var type = ( _dlgTxt.choice ? spinTxt.GetText() : null );
	var type2 = ( _dlgTxt.choice2 ? spinTxt2.GetText() : null );
	if( txt ) eval( _dlgTxt.callback + "(\"" +
		txtTxtDlg.GetText() + "\",\""+type+"\",\""+type2+"\")" );
}


//Show about box.
function ShowAbout()
{
	//Create dialog window.
	dlgAbout = app.CreateDialog( T("About") + " DroidScript" );
	if( !isChrome ) dlgAbout.SetBackColor( "#2E3134" );
	if( orient=="Portrait" ) dlgAbout.SetSize( 0.7, 0.65 );
	else dlgAbout.SetSize( isChrome?0.3:0.4, isChrome?0.7:0.98 );

	//Create layout.
	layAboutDlg = app.CreateLayout( "linear", "vertical,fillxy" );
	//layAbout.SetPadding( 0.2, 0, 0.2, 0.06 );

	//Create scroller.
	var scroll = app.CreateScroller(null,null,"noscrollbar");
	//scroll.SetMargins( 0.05, 0, 0.05, 0 );
	layAboutDlg.AddChild( scroll );

	//Create layout inside scroller.
	var layAbout = app.CreateLayout( "linear", "vertical,fillxy" );
	scroll.AddChild( layAbout );

	//Create image at top.
	var img = app.CreateImage( "/Res/drawable/icon", isChrome?0.07:(isPortrait?0.12:0.08), -1, "" );
	img.SetMargins( 0, 0.02, 0, 0.02 );
	layAbout.AddChild( img );

	//Show version.
	var ver = app.GetDSVersion();
	var build = app.GetDSBuild();
	var s = "Version "+ver+"."+build+(g_tester?" (Beta Tester)":"");
	var txt = app.CreateText( s );
	txt.SetTextSize( isChrome?8:12 );
	if( !isChrome ) txt.SetTextColor("#ffffff");
	layAbout.AddChild( txt );

	//Show IP address.
	var txtIP = app.CreateText( app.GetIPAddress() );
	txtIP.SetTextSize( isChrome?8:12 );
	if( !isChrome ) txtIP.SetTextColor("#ffffff");
	layAbout.AddChild( txtIP );

	//Add 'experiments' option.
	chkExperiments = app.CreateCheckBox( "Experiments" );
	chkExperiments.SetMargins( 0, 0.01, 0, 0 );
	chkExperiments.SetTextSize( isChrome?8:12 );
	chkExperiments.SetChecked( experiments );
	chkExperiments.SetOnTouch( chkExperiments_OnTouch )
	layAbout.AddChild( chkExperiments );

	//Create forum link.
	var txtForum = app.CreateText( "" );
	txtForum.SetMargins( 0, 0.02, 0,0 );
	txtForum.SetTextSize( isChrome?11:16 );
	txtForum.SetTextColor("#56AEF2");
	txtForum.SetHtml( "<u>"+T("Group")+"</u>" );
	txtForum.SetOnTouchDown( txtForum_OnTouchDown );
	layAbout.AddChild( txtForum );

	//Create twitter link.
	var txtTwitter = app.CreateText( "" );
	txtTwitter.SetMargins( 0, 0.02, 0,0 );
	txtTwitter.SetTextSize( isChrome?11:16 );
	txtTwitter.SetTextColor("#56AEF2");
	txtTwitter.SetHtml( "<u>Twitter</u>" );
	txtTwitter.SetOnTouchDown( txtTwitter_OnTouchDown );
	layAbout.AddChild( txtTwitter );

	//Create Facebook link.
	var txtFacebook = app.CreateText( "" );
	txtFacebook.SetMargins( 0, 0.02, 0,0 );
	txtFacebook.SetTextSize( isChrome?11:16 );
	txtFacebook.SetTextColor("#56AEF2");
	txtFacebook.SetHtml( "<u>Facebook</u>" );
	txtFacebook.SetOnTouchDown( txtFacebook_OnTouchDown );
	layAbout.AddChild( txtFacebook );

	//Create Privicy policy link.
	var txtPrivacy = app.CreateText( "" );
	txtPrivacy.SetMargins( 0, 0.02, 0,0 );
	txtPrivacy.SetTextSize( isChrome?11:16 );
	txtPrivacy.SetTextColor("#56AEF2");
	txtPrivacy.SetHtml( "<u>"+T("PrivacyPolicy")+"</u>" );
	txtPrivacy.SetOnTouchDown( txtPrivacy_OnTouchDown );
	layAbout.AddChild( txtPrivacy );

	var btnLicenses = app.CreateButton("Licenses");
	btnLicenses.SetMargins( 0, 0.03, 0,0 );
	btnLicenses.SetTextSize( isChrome?10:16 );
	btnLicenses.SetOnTouch( btnLicenses_OnTouch );
	layAbout.AddChild( btnLicenses );

	//Add dialog layout and show dialog.
	dlgAbout.AddLayout( layAboutDlg );
	dlgAbout.Show();
}

//Enable experimental features.
function chkExperiments_OnTouch( checked )
{
	experiments = checked;
	var restart = "\n\n Please restart DroidScript"
	if( checked ) app.ShowPopup("Experimental features enabled" + (isChrome?restart:""));
	app.SaveBoolean( "Experiments", experiments );
}

//Launch forum link.
function txtForum_OnTouchDown()
{
	app.OpenUrl( "http://groups.google.com/forum/#!forum/androidscript" );
}

//Launch twitter link.
function txtTwitter_OnTouchDown()
{
	app.OpenUrl( "http://twitter.com/droidscript" );
}

//Launch Facebook link.
function txtFacebook_OnTouchDown()
{
	app.OpenUrl( "https://www.facebook.com/DroidScript" );
}

//Launch Privacy link.
function txtPrivacy_OnTouchDown()
{
	app.OpenUrl( "http://www.androidscript.org/Privacy/Privacy-Policy.html" );
}


// Show the license information
function btnLicenses_OnTouch()
{
	dlgLicense = app.CreateDialog("Licenses");
	if( !isChrome ) dlgLicense.SetBackColor( "#2E3134" );
	layLicense = app.CreateLayout( "Linear", "Vertical, FillXY" );
	layLicense.SetPadding( 0.025, 0, 0.025, 0 );

	// Android Trademark
	var licenseText = "<p>Android is a trademark of Google Inc.</p>";

	// Android Robot License
	licenseText += "<p>The Android robot is reproduced or modified from work created and shared " +
	" by Google and used according to terms described in the " +
	"<a href=http://creativecommons.org/licenses/by/3.0/>Creative Commons 3.0</a> " +
	"Attribution License.</p>";

	// Google Play Trademark
	licenseText += "<p>Google Play is a trademark of Google Inc.</p>";

	licenseText += "<p><b>DroidScript and the Wifi IDE make use of the following projects:</b></p>"

	// Jetty License
	licenseText += "<p><a href=http://www.eclipse.org/jetty/>Jetty Web Container</a> is " +
	"Copyright Mort Bay Consulting Pty Ltd, and licensed under the "+
	"<a href=http://www.apache.org/licenses/LICENSE-2.0.html>Apache 2.0 License</a>.</p>";

	// Font Awesome License
	licenseText += "<p><a href=http://fortawesome.github.io/Font-Awesome/>Font Awesome</a> by Dave Gandy " +
	"is licensed under the "+
	"<a href=http://scripts.sil.org/OFL>SIL OFL 1.1</a>.</p>";

	// Ace License
	licenseText += "<p><a href=http://ace.c9.io/>Ace</a> is Copyright Ajax.org B.V. " +
	"and licensed under the <a href=https://github.com/ajaxorg/ace/blob/master/LICENSE>BSD License</a>.</p>"

	// Bootstrap License
	licenseText += "<p><a href=http://getbootstrap.com/>Bootstrap</a> is Copyright Twitter Inc, and licensed " +
	"under the <a href=https://github.com/twbs/bootstrap/blob/master/LICENSE>MIT License</a>.</p>"

	// TextWarrior License
	licenseText += "<p><a href=http://sourceforge.net/projects/textwarrior>TextWarrior</a> is Copyright Tah Wei Hoon " +
	"and is licensed under the <a href=http://www.apache.org/licenses/LICENSE-2.0.html>Apache 2.0 License</a>.</p>";

	// jQuery and jQueryMobile
	licenseText += "<p><a href=http://jquery.com/>jQuery</a> and <a href=http://jquerymobile.com/>jQuery Mobile</a> "+
	"are Copyright The jQuery Foundation, licensed under <a href=https://jquery.org/license/>MIT License</a>.</p>";

	// Uglify
	licenseText += "<p><a href=https://github.com/mishoo/UglifyJS>UglifyJS</a> is Copyright Mihai Bazon " +
	"and licensed under the <a href=https://github.com/mishoo/UglifyJS/blob/master/README.org#license>BSD License</a>.</p>";

	// jqPlot
	licenseText += "<p><a href=http://www.jqplot.com/>jqPlot</a> by Chris Leonello " +
	"is licensed under the <a href=http://opensource.org/licenses/MIT>MIT License</a>.</p>";

	// HTML5 Canvas Gauage
	licenseText += "<p><a href=https://github.com/Mikhus/canv-gauge>HTML5 Canvas Gauge</a> is Copyright Mykhailo Stadnyk " +
	"and licensed under the <a href=http://opensource.org/licenses/MIT>MIT License</a>.</p>";

	// Brython
    licenseText += "<p><a href=https://github.com/brython-dev/brython/>Brython</a> is Copyright Pierre Quentel " +
    "is licensed under the <a href=https://github.com/brython-dev/brython/blob/master/LICENCE.txt>BSD License</a>.</p>";

	var txtLicense = app.CreateText( licenseText, isChrome?0.6:0.95, -1, "Html,Link,Left" );
	txtLicense.SetTextSize( isChrome?9:14 );
	layLicense.AddChild( txtLicense );

	//Add dialog layout and show dialog.
	dlgLicense.AddLayout( layLicense );
	dlgLicense.Show();
}

//Check if IDE is in foreground.
function InForeground()
{
    var apps = app.GetRunningApps()
    var name = app.GetPackageName()
    for(var i in apps) {
        if(apps[i].name==name) return apps[i].foreground
    }
}

//Handle IDE commands (via jetty web service).
function OnIDE( cmd, param1, param2 )
{
	isWebIDE = true;
	app.SaveText( "_IdeType", "wifi", "spremote" );

	g_debugParams = "debug,remote";
	clearInterval( udpTimer );

	if( (cmd=="run" || cmd=="demo") && !allowBackRun && !InForeground() ) {
	    if( premium ) app.ShowPopup( "Please enable 'Background Launch' in DroidScript settings", "long" )
	    else app.ShowPopup( "Background Launch is a Premium feature", "long" )
	    //app.SendIntent( null, null,
	    //    "android.settings.action.MANAGE_OVERLAY_PERMISSION", null, "package:"+app.GetPackageName() )
	}

	if( cmd=="refresh" ) {
		ShowIcons( true )
	}
	else if( cmd=="setprog" ) {
		console.log( "setprog:" + param1 );
		SetCurProg( param1 )
	}
	else if( cmd=="run" ) {
		LaunchApp( param1, "" );
	}
	else if( cmd=="demo" )
	{
		app.WriteFile( tempFldr + "/~demo.js", unescape(param1) );
		RunDemo( tempFldr + "/~demo.js" );
	}
	else if( cmd=="execute" )
	{
	    var ext = ".js"
	    var code = unescape(atob(param2))
	    if( code.startsWith("python:") ) { code = code.substr(7); ext=".py" }

		if( param1=="app" ) {
			app.WriteFile( tempFldr + "/~demo"+ext, code );
			RunDemo( tempFldr + "/~demo"+ext );
		}
		else if( param1=="file" ) RunDemo( code );
		else if( param1=="ide" ) _SafeRun( code );
		else if( param1=="usr" ) app.Broadcast( "Exec", code );
	}
	else if( cmd=="exec" )
	{
		var js = param1;
		if( js[0]=="?" ) {
			js = "console.log(" + js.substr(1) + ")";
			app.Broadcast( "Exec", js );
		}
		else if( js[0]=="$" )
		{
			var s = js.substr(1);
			if( s.trim()=="logcat" ) s = "logcat -t 100 -v brief";

			var apps = JSON.stringify(app.GetRunningApps());
			if( apps.indexOf(":NewActivityProcess")>-1 ) {
				js = "app.SysExec(\""+s+"\",\"log,sh\",100,3)";
				app.Broadcast( "Exec", js );
			}
			else app.SysExec( s, "log,sh", 100,3 );
		}
		else if( js[0]=="!" )
		{
			var cmd = js.substr(1).trim().split(" ");
			var cmd_ = cmd.shift()
			var thecmd = cmd_.toLowerCase();
			if( thecmd=="screenshot" ) {
				var apps = JSON.stringify(app.GetRunningApps());
				var newAct = apps.indexOf(":NewActivityProcess") > -1;
				if( newAct ) app.Broadcast( "Exec", "app.ScreenShot(\"/storage/emulated/0/DroidScript/.edit/screenshot.jpg\")" );
				else app.ScreenShot( "/storage/emulated/0/DroidScript/.edit/screenshot.jpg" );
			}
			else if( thecmd=="settings" ) { ShowSettings() }
			else if( thecmd=="exit" ) { /*notifyDS.Cancel();*/ app.Exit( true ) }
			else if( thecmd=="test" ) { console.log("Hello World!") }
			else if( thecmd=="clean" ) { Clean() }
			else if( thecmd=="reset" ) { Reset( cmd.join(" ") ) }
			else if( thecmd=="delete" ) { Delete( cmd.join(" ") ) }
			else if( thecmd=="show" ) { Show( cmd.join(" ") ) }
			else if( thecmd=="addplugin" ) InstallPlugin( cmd.join(" "),null );
			else if( thecmd=="remplugin" ) RemovePlugin( cmd.join(" ") );
			else if( thecmd=="remextension" ) RemoveExtension( cmd.join(" ") );
			else if( thecmd=="plugindocs" ) ExtractPluginDocs( cmd.join(" ") );
			else if( thecmd=="refresh" ) ShowIcons( true );
			else if( thecmd=="addmodule" ) InstallModule( cmd.join(" ") );
			//else if( thecmd=="startnode" ) StartNodeServer();
			else if( thecmd=="serv" ) Serv( cmd.join(" ") );
			else if( thecmd=="addpackage" ) {
				if(cmd[cmd.length-1].match(/\.\w\w\w$/)) cmd.push(cmd.slice(-3));
				DownloadSPK( cmd.slice(0,-1).join(" ") );
			}
			else if( thecmd=="savespk" ) SaveSPK();
			else if( thecmd=="buildapk" ) {
				debugApk = !cmd[3]; useApkAssets = true; remoteBuild = true;
				keyFileDbg = "/storage/emulated/0/.DroidScript/debug.keystore";
				keyFile = "/storage/emulated/0/DroidScript/APKs/user.keystore";
				BuildPackage( cmd[0], curProgram, parseFloat(cmd[1].replace(",",".")), cmd[2], cmd[3]?cmd[3]:"android" );
			}
			else if( thecmd=="buildaab" ) {
                debugApk = false; useApkAssets = true; remoteBuild = true; g_aab = true;
                keyFile = "/storage/emulated/0/DroidScript/APKs/user.keystore";
                BuildPackage( cmd[0], curProgram, parseFloat(cmd[1].replace(",",".")), cmd[2], cmd[3]?cmd[3]:"MyPassword" );
            }
			else if( thecmd=="getperms" ) {
				permissions = "";
				ScanFile( appPath+"/"+curProgram+"/"+ curProgram+".js", true );
				_Dbg( "permissions: "+permissions )
			}
			else Command( cmd_, cmd.join(" ") );
		}
		else
			app.Broadcast( "Exec", js );

	}
	else if( cmd=="sample" )
	{
		if( param1.indexOf("&#9830;")>-1 ) {
			app.ShowPopup( "Please upgrade to 'DroidScript Premium' to access this sample" );
			return;
		}
		isSample = true;
		var sampPath = "/assets/samples/";
		if( app.GetAppLangCode() != "en" ) sampPath = docsPath + "/samples/";
		StartApp( sampPath+param1+".js", "debug,remote" );
	}
	else if( cmd=="downloadspk" )
	{
		DownloadSPK( param1 );
	}
}

function OnIdeConnect( ip )
{
	//If a remote connection.
	if( ip.indexOf("127.0.0.1")<0 )
	{
	    //Hide editor and any dialogs.
	    app.HideDialogs()
	    if( layEdit && layEdit.IsVisible() ) CloseEditor();

	    //Record remote connection ip.
	    remotes.push( ip )
	    app.SaveText( "_Remotes", remotes.join(","), "spremote" );

		if( webAce ) webAce.Gone();
		if( layFront ) layFront.Gone();
		if( layRight ) layRight.Gone();
		if( layLeft ) layLeft.Gone();
		if( txtRemote ) { ShowRemotes(); txtRemote.Show() }
	}
}

//Display remote connections list.
function ShowRemotes()
{
    var txt = ""
    for( var r of remotes ) txt += (noIcons ? "Wifi" : "[fa-laptop]  ") + r + "\n"
    txtRemote.SetText( txt );
}

function OnIdeDisconnect( ip )
{
	if( ip.indexOf("127.0.0.1") < 0 )
	{
        //Remove remote ip connection from list.
        //remotes = remotes.filter(item => item !== ip)
        if( remotes.includes(ip) ) remotes.splice( remotes.indexOf(ip), 1 );
        app.SaveText( "_Remotes", remotes.join(","), "spremote" );
        if( txtRemote ) ShowRemotes()

        if( remotes.length == 0 || ip=="*" ) {
            if( txtRemote ) txtRemote.Gone();
            if( webAce ) webAce.Show();
            if( layFront ) layFront.Show();
            remotes = []
        }
	}
}

function DownloadSPK( url )
{
	spkUrl = decodeURIComponent( url );

	if( spkUrl.indexOf("://")>-1 )
	{
		//Download spk file from web.
		dloadspk = app.CreateDownloader();
		dloadspk.SetOnDownload( dloadspk_OnDownLoad );
		dloadspk.SetOnError( dloadspk_OnError );
		dloadspk.Download( url, tempFldr );
	}
	else {
		//install from sdcard.
		if( spkUrl.indexOf("/")==-1 ) spkUrl = "/storage/emulated/0/DroidScript/SPKs/"+spkUrl;
		CheckPackage( spkUrl );
	}
}

//Handle demo download completion.
function dloadspk_OnDownLoad( file )
{
    console.log( file )
	spkTitle = spkUrl.substr( file.lastIndexOf("/")+1 );
	spkFile = file //tempFldr + "/" + spkTitle;

	if( isIO || isTV )
		CheckPackage( spkFile );
	else {
		var s = spkTitle;
		if( s=="download" || s=="download.spk" ) s = "this package";

		var installDiag = app.CreateYesNoDialog( "Script Package Installer:\n\nDo you trust the source of "+s+"?" );
		installDiag.SetOnTouch( installDiag_OnTouch );
		installDiag.Show();
	}
}

//Handle demo download errors.
function dloadspk_OnError()
{
	app.ShowPopup( "Download failed!" );
}

//Save an SPK to sdcard.
function SaveSPK()
{
	app.MakeFolder( "/storage/emulated/0/DroidScript/SPKs" );
	CreatePackage( curProgram, "/storage/emulated/0/DroidScript/SPKs" );
	var msg = "SPK created in:\n /DroidScript/SPKs";
	app.ShowPopup( msg, "long" );
}


//Create a project package.
function CreatePackage( appName, destFldr, version )
{
	//Create project zip file.
	var src = app.GetPath()+"/"+appName;
	var dest = destFldr+"/"+appName+(version?"_"+version:"")+".spk";
	app.ZipFolder( src, dest, "spk" );
	return dest;
}

//Create a project package.
function CreatePackageX( appName, destFldr, version )
{
    var safeAppName = appName.replace(/[^\x00-\x7F]/g, "");
    safeAppName = safeAppName.replaceAll(" ","_");

	//Create project zip file.
	var zip = app.CreateZipUtil();
	var fldr = app.GetPath()+"/"+appName;
	var file = destFldr+"/"+safeAppName+(version?"_"+version:"")+".spk";
	zip.Create( file );

	//Add project files.
	AddFolder( zip, safeAppName.replace(/[^\x00-\x7F]/g, ""), fldr );

	//Close zip file.
	zip.Close();
	return file;
}

//Recursively add folder contents to zip.
//(Optionally swap .js extensions so Gmail will allow attachments)
function AddFolder( zip, name, fldr, noExtSwap )
{
	var list = app.ListFolder( fldr,"");
	for( var i=0; i<list.length; i++ )
	{
		var title = list[i];
		if( !app.IsFolder( fldr+"/"+title ) ) {
			if( noExtSwap ) zip.AddFile( name+"/"+title, fldr+"/"+title );
			else zip.AddFile( name+"/"+title.replace(".js",".js.txt"), fldr+"/"+title );
		}
		else AddFolder( zip, name+"/"+title, fldr+"/"+title, noExtSwap );
	}
}

//Check an spk/ppk package.
function CheckPackage( file )
{
	var type = "spk";
	if( file.includes(".ppk") ) type = "ppk"
	else if( file.includes(".epk") ) type = "epk"

	//Create zip util.
	zip = app.CreateZipUtil();
	zip.Open( file );

	//Get top level entry.
	var list = zip.List( "/" );
	zip.Close();

	//Check for valid package.
	if( !list ) {
		app.ShowPopup("Invalid package!");
		return;
	}
	//Check for overwrite.
	var lst = list.split(",");
	var fldr = app.GetPath();

	if( !isIO && type=="spk" && app.FolderExists( fldr+"/"+lst[0] ) )
	{
		overwriteDiag = app.CreateYesNoDialog( "Overwrite existing App?" );
		overwriteDiag.SetOnTouch( overwriteDiag_OnTouch );
		overwriteDiag.data.file = file;
		overwriteDiag.data.type = type;
		overwriteDiag.Show();
	}
	else
	{
		//Install package.
		InstallPackage( file, type );
		//app.ShowPopup( "Package installed" );
		if( webAce && type=="spk" ) webAce.Execute( "refreshAppsList()" );
	}
}

//Handle overwrite spk dialog.
function overwriteDiag_OnTouch( result )
{
	if( result=="Yes" ) {
		InstallPackage( overwriteDiag.data.file, overwriteDiag.data.type );
		//app.ShowPopup( "Package installed" );
	}
	else app.ShowPopup( "Package not installed" );
}

//Create node instance if not done.
function InitNode( onReady )
{
    if( !node )
    {
        //Create NodeJS instance (add paths just in case user builds aab in same session)
        var plugDir = app.GetPrivateFolder( "Plugins" );
        node_paths = appPath+"/.node/node_modules:"+plugDir+"/apkbuilder:"+ plugDir+"/apkbuilder/protobuf"
        node = app.CreateNode( node_paths, "extend" )
        node.SetEnv( "DEBUG", "live-plugin-manager" )
        node.SetEnv( "DEBUG_HIDE_DATE", "1" )
        node.SetEnv( "DS_DIR", app.RealPath("/storage/emulated/0/DroidScript") )
        node.SetEnv( "DS_DATA_DIR", app.RealPath("/storage/emulated/0/.DroidScript") )
        node.SetOnOutput( function(msg){ _Dbg(msg.replace("live-plugin-manager","")) } )
        node.SetOnError( function(msg){ _Dbg(msg.replace("live-plugin-manager","")) } )
        node.SetOnReady( onReady )
        return
    }
    onReady()
}

/*
//Start the nodejs server for remote terminal etc.
function StartNodeServer( onDone )
{
    if( !glob.nodeServerStarted ) {
        InitNode( function(){ node.Run(appPath+"/.node/node_server.js", "term")} )
        if( onDone ) node.SetOnDone( onDone )
        glob.nodeServerStarted = true
    }
    else if( onDone ) onDone()
}*/

//Start the wifi ide file server.
function StartFileServer()
{
    if( glob.fileServerStarted ) return
    glob.fileServerStarted = true

    if( premium ) {
        InitNode( ()=>{
            node.Execute( "@fs" )
            while( !node.IsDone() ) app.Wait( 1, true )

            node.SendMessage(`isds:${_isIDE}`)
            node.SendMessage(`ispremium:${true}`)
            //node.SendMessage(`extsdcard:${app.GetExternalFolder()}`)
            node.SendMessage(`password:${app.LoadText("Password")}`)
            node.SendMessage(`usepassword:${app.LoadBoolean("UsePass", false)}`)
            node.SendMessage( "start" )

            setTimeout( RunExtensions, 0 )
        } )
    }
    else RunExtensions()
}

//Handle local extension commands.
function Command( cmd, params )
{
    if( !curProgram ) { _Dbg("Error: No DroidScript project has been run in this session!"); return; }

    //Get extension name with correct case.
    for( name of editMenus )
        if( name.toLowerCase()==cmd ) cmd = name;

    var file = appPath+"/Extensions/"+cmd+"/Commander/Commands.js";
    if ( app.FileExists( file )) {
        _LoadScriptSync( file, true );
        ext_progId = "ext_"+curProgram.replaceAll(" ","_").toLowerCase()
        eval( cmd+"_OnCommand('"+params+"')" );
    }
}

//Run the server parts of any installed extensions.
function RunExtensions()
{
    console.log('Checking extensions...');
    var list = app.ListFolder( appPath+"/Extensions", null, null, "folders");

    for( var f of list ) {
        RunExtension( f );
    }
}

function RunExtension( name, ctxId )
{
    if (!name) return;

    //Check for extra DS commands/menus.
    var menusFile = appPath+"/Extensions/"+name+"/Commander/Commands.js";
    var cmdsFile = appPath+"/Extensions/"+name+"/Commander/Commands.json";
    if( app.FileExists( menusFile ) ) {
        editMenus.push( name )
        if( app.FileExists( cmdsFile ) ) {
            var cmds = JSON.parse(app.ReadFile( cmdsFile ))
            var s = ""; for( var c in cmds ) s += (s?"|":"") + cmds[c]
            app.SaveText( "Commands", s );
        }
    }

    //Check for extension server scripts (called at startup of DS).
    var dir = appPath+"/Extensions/"+name+"/Server";
    var fullPath = dir+"/node_"+name+".js";
    if ( app.FileExists( fullPath )) {
        console.log('running ' + fullPath + '...');
        InitNode( function() {
            var ops = name=="MicrocoXXXntroller" ? "extend" : ""
            node.Run( fullPath, "ext_"+name, node_paths+":"+dir+"/node_modules" + ":" +dir, ops )
        })
    }
    //Check for local extensions (eg. Samples extension).
    //(todo: finish this generic local extension handler)
    /*var jsonPath  = appPath+"/Extensions/"+name+"/Right/"+name+".json";
    if( v3 && app.FileExists( jsonPath )) {
        var config = JSON.parse( app.ReadFile(jsonPath) )
        if( config.local ) {
            var path = "http://127.0.0.1:8088/Extensions/"+name+"/Right/"+name+".html"
            setTimeout( ()=>{ eval("web"+name).LoadUrl( path )}, 2000 )
        }
    }
    */
}

//Install a node module
function InstallModule( module )
{
	if( !curProgram ) { _Dbg("Error: No project has been run in this session!"); return; }

    app.ShowProgress( "Installing " + module + "...", "top" )
    tmrProg = setTimeout( function(){app.HideProgress();}, 60000 )

    //Create base node_modules folder if not exists.
    var dir = appPath+"/"+curProgram+"/node_modules"
    if( !app.FolderExists( dir ) ) app.MakeFolder( dir )

    //Init node and add module.
    InitNode( function(){ node.AddModule( module, appPath+"/"+curProgram ) }  )
    node.SetOnDone( function(){ app.HideProgress(); clearTimeout(tmrProg) } )
}


//Install an spk/ppk package.
function InstallPackage( file, type )
{
	if( type == "ppk" ) {
		InstallPlugin( file, null );
		return;
	}
	//Extract files and folders.
	var fldr = app.GetPath();
	if( type == "epk" ) fldr += "/Extensions";
	//ExtractFiles( zip, "/", fldr, true );
	app.UnzipFile( file, fldr, "spk" )

	// delete temp package file
	if( file.startsWith(tempFldr) ) app.DeleteFile( file );
	app.ShowPopup( "Package installed" );

	//Refresh icons and wifi ide.
	if( type == "spk" ) { ShowIcons(); _IdeCmd("refresh") }
}

//Install an spk/ppk package.
function InstallPackageX( file, type )
{
	if( type == "ppk" ) {
		InstallPlugin( file, null );
		return;
	}
	//Create project zip file.
	var zip = app.CreateZipUtil();
	zip.Open( file );

	//Extract files and folders.
	var fldr = app.GetPath();
	if( type == "epk" ) fldr += "/Extensions";
	ExtractFiles( zip, "/", fldr, true );

	//Close zip file.
	zip.Close();

	// delete temp package file
	if( file.startsWith(tempFldr) ) app.DeleteFile( file );
	app.ShowPopup( "Package installed" );

	//Refresh icons and wifi ide.
	if( type == "spk" ) { ShowIcons(); _IdeCmd("refresh") }
}

//Recursively extract zip contents.
function ExtractFiles( zip, path, fldr, isSpk )
{
	var list = zip.List( path );
	if( !list ) { app.ShowPopup("Invalid package!"); return; }

	app.MakeFolder( fldr );
	var lst = list.split(",");
	for( var i=0; i<lst.length; i++ )
	{
		var name = lst[i];
		if( name.indexOf("/")==-1) {
			zip.Extract( (path+name).substr(1), fldr+path+name.replace(".js.txt",".js") )
		}
		else {
			app.MakeFolder( fldr+(path+name).slice(0,-1) );
			ExtractFiles( zip, path+name, fldr, isSpk );
		}
	}
}

//Show the plugins dialog.
function ShowPlugins()
{
	//Create dialog window.
	dlgPlug = app.CreateDialog( "Plugins" );
	if( !isChrome ) dlgPlug.SetBackColor( "#2E3134" );
	layPlug = app.CreateLayout( "linear", "vertical,fillxy" );
	if( isPortrait ) layPlug.SetPadding( 0.03, 0.015, 0.03, 0.015 );
	else layPlug.SetPadding( 0.015, 0.03, 0.015, 0.03 );

	//Create a web control.
	webPlug = app.CreateWebView( isChrome?0.5:0.85, 0.75, "IgnoreErrors" );
	//webPlug.SetMargins( 0, 0.01, 0, 0.02 );
	webPlug.SetOnProgress( webPlug_OnProgess );
	layPlug.AddChild( webPlug );

	//Add dialog layout and show dialog.
	dlgPlug.AddLayout( layPlug );
	dlgPlug.Show();

	//Load page
	app.ShowProgress("Loading...");
	setTimeout( function(){app.HideProgress()}, 7000 );
	if( premium ) webPlug.LoadUrl( "http://www.androidscript.org/Plugins/PremPlugins.html" );
	else webPlug.LoadUrl( "http://www.androidscript.org/Plugins/Plugins.html" );
}

//Show page load progress.
function webPlug_OnProgess( progress )
{
	if( progress != 100 ) return;
	app.HideProgress();
}

//Handle WebStore link clicks.
function webStore_OnUrl(url)
{
    //Hack urls to keep downloads working (till site can be updated)
    if( url.includes( "/uploads/" ) ) { app.OpenUrl( url ); return }
    if( !url.includes( "app=1" ) ) url = url.replace("uploads?","uploads?type=spk&app=1&")

    //Temporarily hide webstore to hide white flash.
    webStore.Hide()
    setTimeout( function(){webStore.Show()}, 3000 )

    //Load webstore.
    webStore.LoadUrl( url )
}

//Handle WebStore page load.
function webStore_OnConsole( msg )
{
    if( msg=="DroidStore Loaded" )
    {
        setTimeout( function()
        {
        	    console.log( "Setting Store theme")
        		//webStore.Execute( 'document.querySelector("html").setAttribute("data-theme", "' +
        		//	(useDarkTheme?'dark':'light') + '")');

        		//Hide the headers and footer.
        		var js = 'document.querySelector("nav").hidden=true; '
        		js += 'document.querySelector("footer").hidden=true; '
        		js += 'document.querySelector(".dropdown-divider").hidden=true; '

        		//Hack the colours/margins till we can update the website.
        		if( useDarkTheme )
        		{
        		    //Modify body colours.
        		    js += 'document.querySelector(".btn").style.color="#fff"; '
        		    js += 'document.body.style.backgroundColor="#26282A"; '
        		    js += 'document.body.style.color="white"; '

        		    //Modify the file_details colour and margins.
            		js += 'var style = document.createElement("style"); '
                    js += 'style.type = "text/css"; '
                    js += 'style.innerHTML = ".file_details { color:#fff; margin:0em 0em 1em 0em; };"; '
                    js += 'document.getElementsByTagName("head")[0].appendChild(style); '
        		}

                //Add more space between store items.
        		js += 'var style = document.createElement("style"); '
                js += 'style.type = "text/css"; '
                js += 'style.innerHTML = ".mt-1,.my-1 { margin-bottom:2em };"; '
                js += 'document.getElementsByTagName("head")[0].appendChild(style); '

        		//Hide the cookie message (not needed for apps)
        		js += 'var style = document.createElement("style"); '
                js += 'style.type = "text/css"; '
                js += 'style.innerHTML = ".cookiealert { display: none; };"; '
                js += 'document.getElementsByTagName("head")[0].appendChild(style); '

        		webStore.Execute( js )
        		setTimeout( function(){webStore.Show()}, 200 )
        }, 1000 )
    }
}

//Check for premium.
function CheckLicenses()
{
	if( !isIO )
	{
		//Create Google Play object (if not done).
		if( !playStore ) {
		    playStore = app.CreatePlayStore();
		    playStore.SetOnReady( OnPlayStoreReady )
		}
	}
}

//Called when playstore is connected.
function OnPlayStoreReady()
{
    if( !crypt ) crypt = app.CreateCrypt();
    //setTimeout( function(){ playStore.GetPurchases(OnLicenses) }, 1000 );
    playStore.GetPurchases( OnLicenses )
    //setTimeout( GetPremiumStatus, 1500 );
    GetPremiumStatus()
}

//Save licenses.
function OnLicenses( items )
{
	for( var i=0; i<items.length; i++ )
		purchases[items[i].productId] = (items[i].purchaseState==0);
}

//Get prices from google play etc.
function UpdatePluginInfo( prodIDs, versions )
{
	//Store version info for each plugin.
	var pluginIDs = prodIDs.split(",");
	var vers = versions.split(",");
	for( var i=0; i<pluginIDs.length; i++ )
		pluginVersions[pluginIDs[i]] = parseFloat(vers[i]);

	//Get product info from Google Play.
	//(Only paid items will be listed in OnStoreInfo)
	playStore.GetBillingInfo( prodIDs, OnStoreInfo );
}

//Show Play Store prices.
function OnStoreInfo( items )
{
	//Show prices.
	for( var i=0; i<items.length; i++ )
	{
		var prodId = items[i].productId.replaceAll(".","_")
		var div = prodId+"_price";
		var price = premium ? "" : items[i].price;
		webPlug.Execute( div+".innerHTML='"+price+"'" );
		if( premium ) {
			var btn = prodId+"_button";
			webPlug.Execute( "document.getElementById('"+btn+"').value='   Install   '" );
			CheckPluginVersion( prodId );
		}
	}

	//Set 'Buy/Reinstall/Update' button states.
	if( !premium ) playStore.GetPurchases( OnPurchases );
}

//Show Play Store item info.
function OnPurchases( items )
{
	for( var i=0; i<items.length; i++ )
	{
		var prodId = items[i].productId.replaceAll(".","_")
		if( !premium )
		{
			//Get appropriate button label.
			var btn = prodId+"_button";
			var label = ((items[i].purchaseState==0) ? "   Install   " : "    Buy    " );
			webPlug.Execute( "document.getElementById('"+btn+"').value='"+label+"'" );
		}

		//If purchased, check plugin version.
		if( items[i].purchaseState==0 ) {
			CheckPluginVersion( prodId );
		}

		//Save purchased items.
		purchases[items[i].productId] = (items[i].purchaseState==0);
	}
}

//Update version state of free plugins.
function UpdateFreePluginInfo( prodIDs, versions )
{
	//Check and update version for each plugin.
	var pluginIDs = prodIDs.split(",");
	var vers = versions.split(",");
	for( var i=0; i<pluginIDs.length; i++ )
	{
		pluginVersions[pluginIDs[i]] = parseFloat(vers[i]);
		CheckPluginVersion( pluginIDs[i] );
	}
}

//Check if plugin is up-to-date.
function CheckPluginVersion( prodId )
{
	//Get local plugin version.
	var plgName = prodId.replace("plugin_","");
	var privDir = app.GetPrivateFolder( "Plugins" );
	var plgFile = privDir+"/"+plgName+"/Version.txt";
	var version = parseFloat( app.ReadFile( plgFile ));
	if( isNaN(version) ) return;

	//Get remote version.
	var versionRem = pluginVersions[prodId];
	var btn = prodId+"_button";

	//Compare with versions and change label if neccessary.
	if( version < versionRem ) {
		webPlug.Execute( "document.getElementById('"+btn+"').value='  Update  '" );
	}
	else
		webPlug.Execute( "document.getElementById('"+btn+"').value=' Reinstall '" );
}

//Handle Plugins 'Buy' from Plugins HTML page.
function BuyPlugin( prodId, gplay )
{
	//Show warning/license message.
	var txt = "NOTICE\n\n" +
		"Do agree that you will not hold droidscript.org" +
		" or any holding companies responsible for damages or losses incurred due to the use of" +
		" this plugin.\n\n Do you agree?"
	yesNoBuy = app.CreateYesNoDialog( txt );
	yesNoBuy.SetOnTouch( yesNoBuy_OnTouch );
	yesNoBuy.prodId = prodId;
	yesNoBuy.gplay = gplay;
	yesNoBuy.Show();
}

//Handle accepting/rejecting plugin license.
function yesNoBuy_OnTouch( result )
{
	//Start the purchase process.
	if( result=="Yes" )
		playStore.Purchase( yesNoBuy.prodId, "xbx345xbx", OnPurchased );
}

//Handle completed purchase.
function OnPurchased( prodId )
{
	//Update purchase state.
	purchases[prodId] = true;

	//alert( "OnPurchased" + prodId );
	//Install the plugin.
	InstallPlugin( prodId, yesNoBuy.gplay );

	//Update 'buy' button to 'Reinstall'.
	prodId = prodId.replaceAll(".","_")
	var btn = prodId+"_button";
	var label = "Reinstall";
	webPlug.Execute( btn+".value='"+label+"'" );
}

//Ask to remove a plugin.
function AskRemovePlugin( prodId )
{
	var ynd = app.CreateYesNoDialog("Do you want to uninstall '" + prodId + "'?");
	ynd.SetOnTouch( function(res) {
		if(res != "Yes") return;
		RemovePlugin( prodId );
		app.ShowPopup("Plugin '" + prodId + "' uninstalled.");
	} );
	ynd.Show();
}

//Remove a plugin.
function RemovePlugin( prodId )
{
	//Get plugin name.
	var plugName = prodId.replace("plugin_","").toLowerCase();
	var privDir = app.GetPrivateFolder( "Plugins" );
	app.DeleteFolder( privDir+"/"+plugName );
	app.DeleteFolder( appPath+"/.edit/docs/plugins/"+plugName );

	//Re-list plugins.
	ListPlugins( true );
}

//Handle Plugins 'Install'
function InstallPlugin( prodId, gplay )
{
	//Get sensible plugin name.
	plugName = prodId.substr( prodId.lastIndexOf("/")+1 )
		.replace(/\.zip|\.ppk|plugin_/g, "").toLowerCase();
    if( plugName.includes("_") ) plugName = plugName.split("_")[0];

	//Set dest folder.
	var privDir = app.GetPrivateFolder( "Plugins" );
	plugDir = privDir+"/"+plugName;
	app.MakeFolder( plugDir );

	//Check for local plugin (in 'DroidScript/Plugins' folder).
	if( prodId.indexOf("/")>-1 ) {
		plugFile = prodId;
		dload_OnComplete();
	}
	//Check for GooglePlay install method.
	else if( gplay && gplay!='undefined' ) {
		app.OpenUrl( "market://details?id="+gplay );
	}
	else
	{
		//Set plugin file urls.
		var url = "http://www.androidscript.org/Plugins/";
		if( g_tester ) url = "http://www.androidscript.org/PluginsTest/";
		var src = url + plugName + ".zip";

		//Download plugin files from web.
		plugFile = plugDir + "/" + plugName + ".zip";
		dload = app.CreateDownloader();
		dload.SetOnDownload( dload_OnComplete );
		dload.SetOnError( dload_OnError );
		dload.Download( src, plugDir );

		//Update license info.
		if( !isIO ) CheckLicenses();
	}
}

//Handle Plugins 'OK' click.
function btnPlugOK_OnTouch()
{
	//Remove dialog.
	dlgPlug.Dismiss();
}

//Handle plugin download completion.
function dload_OnComplete()
{
    app.ShowProgress( "Installing plugin..." )

	//Open plugin zip file.
	var zip = app.CreateZipUtil();
	zip.Open( plugFile );

	//Check if this is a language plugin.
	isLangPlugin = false;
	if( plugName.indexOf("-lang")>-1 ) {
		var code = app.GetAppLangCode( plugName.replace("-lang","") );
		plugDir = "/storage/emulated/0/DroidScript/.edit/docs"+(code=="en"?"":"-"+code);
		setTimeout( ()=>{ if(webDocs) webDocs.Reload() }, 3000 );
		isLangPlugin = true;
	}

	//Extract files and folders.
	ExtractFiles( zip, "/", plugDir );

	//Close zip file and delete it.
	zip.Close();
	if( plugFile.indexOf(plugDir)>-1) app.DeleteFile( plugFile );

    //Extract Layout Extension if this is UI plugin.
    if( plugName=="ui" && v3 ) {
        app.ShowPopup("Extracting extras...");
        app.LoadPlugin("UI")
    }

	//If not built-in plugin (extracted at first run).
	if( appReady )
	{
		if( isLangPlugin )
			app.ShowPopup( "Docs installed", "Long" );
		else {
		    if( plugName!="customtabs" && plugName!="node" ) {
                //Extract plugin docs to .edit/docs folder (for wifi ide).
                var docsDir = appPath+"/.edit/docs/plugins/"+plugName;
                app.CopyFolder( plugDir, docsDir, true );
                app.ShowPopup( "Plugin installed. Please see Docs/Plugins for more information", "Long" );
			}
		}

		//Re-list plugins and extensions (for wifi ide).
		ListPlugins( true );
		ListExtensions( true );
	}
	app.HideProgress()
}

//Extract docs from an installed plugin for Wifi IDE docs.
function ExtractPluginDocs( plugName, internal )
{
	plugName = plugName.toLowerCase();

	//Copy docs to .edit folder.
	var plugDir = app.GetPrivateFolder( "Plugins" )+"/"+plugName;
	var docsDir = appPath+"/.edit/docs/"+(internal?"":"plugins/")+plugName;
	app.CopyFolder( plugDir, docsDir, true, "doevents" );

	// delete non-doc files
	var implFiles = app.ListFolder(docsDir, ".*\.jar|.\.*inc|.*\.dat|.*\.zip", null, "regex,files,fullpath");
	for(var i in implFiles) app.DeleteFile( implFiles[i] );

	//app.ShowPopup( "Plugin docs extracted", "Long" );
}

//Handle plulgin download errors.
function dload_OnError()
{
	app.ShowPopup( "Download failed!" );
}

//List plugins to prefs (for Wifi IDE).
function ListPlugins( refreshDocs )
{
	var plugs = [];
	var fldr =  appPath+"/.edit/docs/plugins"; // app.GetPrivateFolder( "Plugins" );
	var list = app.ListFolder( fldr, null, null, "folders");
	for( var i=0; i<list.length && list[0]!=""; i++ )
	{
		//Filter for folders.
		var plugName = list[i];
		if( app.IsFolder( fldr+"/"+plugName ) )
		{
			//Get case sensitive title of plugin from html file.
			var files = app.ListFolder( fldr + "/" + plugName, "(?i)" + plugName + "\\.html", null, "RegExp" );
			if(files.length == 0) continue;
			plugs.push( files[0].slice(0, -5) );
		}
	}
	app.SaveText( "_Plugins", plugs.join(","), "spremote" );

	//Refresh docs plugins page.
	//if( refreshDocs && webDocs ) webDocs.Reload()
	if( refreshDocs && webDocs ) webDocs.Execute("ShowPluginsPage()")
}

//List extensions to prefs (for Wifi IDE).
function ListExtensions( refreshDocs )
{
    //List the extensions folder.
	var list = app.ListFolder( appPath+"/Extensions", null, null, "folders");
	app.SaveText( "_Extensions", list.join(","), "spremote" );

	//Refresh docs plugins page.
	//if( refreshDocs && webDocs ) webDocs.Reload()
	if( refreshDocs && webDocs ) webDocs.Execute("ShowExtensionsPage()")
}

//Ask to remove an extension.
function AskRemoveExtension( prodId )
{
	var ynd = app.CreateYesNoDialog("Do you want to uninstall '" + prodId + "'?");
	ynd.SetOnTouch( function(res) {
		if(res != "Yes") return;
		RemoveExtension( prodId );
		app.ShowPopup("Extension '" + prodId + "' uninstalled.");
	} );
	ynd.Show();
}

//Remove an extension.
function RemoveExtension( prodId )
{
	//Get extension name.
	var extName = prodId.replace("extension_","").toLowerCase();
	app.DeleteFolder( appPath+"/Extensions/"+extName );

	//Re-list extensions.
	ListExtensions( true );
}

//Copy user plugins into private plugins folder.
function ImportUserPlugins( progress )
{
	var pubFldr = app.GetPath()+"/Plugins/";

	//List plugin files.
	var list = app.ListFolder( pubFldr, ".*\.zip|.*\.ppk", null, "regexp" );
	for( var i=0; i<list.length; i++ )
	{
	    //Remove version part of file name after '_' character (if present).
	    var name = list[i]
		InstallPlugin( pubFldr+name );
		app.DeleteFile( pubFldr+name );

		if( (app.IsNewVersion() || progress) /*&& !isTV*/ ) //<-- can lockup X96Max
		    app.UpdateProgressBar( 80+Math.round(20*i/list.length), "doevents" );
	}
}

//Extract plugin docs if docs/plugins/* folder is missing.
function ExtractMissingPluginDocs()
{
	var editDir = appPath+"/.edit";
	if( !app.FolderExists( editDir + "/docs/plugins" )) app.MakeFolder( editDir + "/docs/plugins" );
    var force = app.IsNewVersion()

	var privDir = app.GetPrivateFolder( "Plugins" );
	var privPlugs = app.ListFolder( privDir, null, null, "folders" );
	for( var plugName of privPlugs ) {
	    var internal = ( plugName=="customtabs" || plugName=="node" || plugName=="ui" )
		if( !app.FolderExists( editDir+"/docs/"+(internal?"":"plugins/")+plugName ) || force )
			ExtractPluginDocs( plugName, internal );
	}

	//Special case for docs plugin.
	if( !app.FileExists( editDir + "/docs/Docs.htm" )) {
	    app.CopyFile( "/Sys/sdcard/Plugins/english-lang.zip", appPath+"/Plugins/english-lang.zip" );
        ImportUserPlugins( true );
    }
}

//Convert and import user Apk plugins.
function ConvertApkPlugins()
{
	//List apk files.
	var pubFldr = app.GetPath()+"/Plugins/";
	var list = app.ListFolder( pubFldr, ".apk" );
	for( var i=0; i<list.length; i++ )
	{
		//Ignore part of file name after '_' character (if present)
		var name = list[i].slice(0,-4);
		//if( name.includes("_") ) name = name.split("_")[0];

		//Convert to normal plugin.
		ApkToPlugin( pubFldr+list[i], name );
	}
}

//Convert a plugin APK to a normal plugin.
function ApkToPlugin( apkFile, plugName )
{
	//Extract plugin files from APK.
	var tmpFldr = "/storage/emulated/0/.DroidScript/Temp";
	app.UnzipFile( apkFile, tmpFldr+"/Plugin" );

	//Zip classes.dex file into a jar file in assets folder.
	var jarFile = tmpFldr+"/Plugin/assets/"+plugName+".jar";
	var zipper = app.CreateZipUtil();
	zipper.Create( jarFile );
	zipper.AddFile( "classes.dex", tmpFldr+"/Plugin/classes.dex" );
	zipper.Close();

	//Zip all assets files into a zip file.
	var plugFile = tmpFldr + "/Plugin/"+ plugName + ".zip";
	app.ZipFile( tmpFldr+"/Plugin/assets", plugFile );

	//Copy plugin file to plugins folder.
	var plugFldr = "/storage/emulated/0/DroidScript/Plugins";
	app.CopyFile( plugFile, plugFldr+"/"+plugName.toLowerCase()+".zip" );

	//Delete original apk file.
	app.DeleteFile( apkFile );
}

//Show the APK/AAB building dialog.
function ShowBuildDialog( aab )
{
    //Store aab flag and create node instance if aab mode.
    g_aab = aab
    if( aab && !node ) {
        InitNode( function(){} )
        node.SetOnDone( function(){} )
	}

	//Create dialog window.
	dlgApk = app.CreateDialog( aab ? "Build AAB" : "Build APK" );
	if( !isChrome ) dlgApk.SetBackColor( "#2E3134" );
	layApk = app.CreateLayout( "linear", "vertical,fillxy" );
	layApk.SetPadding( 0.05, 0, 0.05, 0 );

	//Create default package name.
	var packTitle = curProgram.replace( RegExp( " ","gim"), "" ).toLowerCase();
	packTitle = packTitle.replace( RegExp( "-","gim"), "" );
	var packRoot = app.LoadText( "_userOrg", "com.myname", "spremote" );
	var packName = packRoot + "." + packTitle;
	packName = packName.replace("sw-","");
	packName = packName.replace("sws-","");

	//Create 'package name' text box.
	packName = app.LoadText( curProgram+"_pkgName", packName, "spremote" );
	txtApkPkg = app.CreateTextEdit( packName, isChrome?0.4:0.75 );
	layApk.AddChild( txtApkPkg );

	//Create 'version' text box.
	var verNum = app.LoadText( packName+"_version", "1.00", "spremote" );
	txtApkVer = app.CreateTextEdit( verNum, 0.2 );
	layApk.AddChild( txtApkVer );

	//Create 'debug' checkbox.
	chkBuildDbg = app.CreateCheckBox( "Debug Build" );
	chkBuildDbg.SetMargins( 0,8,0,8, "dip" );
	layApk.AddChild( chkBuildDbg );
	chkBuildDbg.SetChecked( false );
	chkBuildDbg.SetOnTouch( chkBuildDbg_OnTouch );
	if( aab ) chkBuildDbg.Gone()

	//Create 'obfuscate code' checkbox.
	chkObfuscate = app.CreateCheckBox( "Obfuscate Code" );
	chkObfuscate.SetMargins( 0,8,0,8, "dip" );
	layApk.AddChild( chkObfuscate );
	chkObfuscate.SetChecked( true );

	//Create 'include assets' checkbox.
	chkApkAssets = app.CreateCheckBox( "Include System Assets" );
	chkApkAssets.SetMargins( 0,0,0,8, "dip" );
	layApk.AddChild( chkApkAssets );
	chkApkAssets.SetChecked( true );

	//Create horizontal layout for Ok and Cancel buttons.
	layApk2 = app.CreateLayout( "linear", "horizontal,fillxy,center" );
	layApk.AddChild( layApk2 );

	//Create OK button.
	layApk2.SetMargins( 0, 0.02, 0, 0.01 );
	btnBuildOK = app.CreateButton( "OK", isChrome?0.2:0.25 );
	btnBuildOK.SetOnTouch( btnBuildOK_OnTouch );
	layApk2.AddChild( btnBuildOK );

	//Create Cancel button.
	btnBuildCancel = app.CreateButton( "Cancel", isChrome?0.2:0.25 );
	btnBuildCancel.SetOnTouch( btnBuildCancel_OnTouch );
	layApk2.AddChild( btnBuildCancel );

	//Add dialog layout and show dialog.
	dlgApk.AddLayout( layApk );
	dlgApk.Show();

	//Set default password.
	keyPass = "MyPassword";
}

//Handle debug check box.
function chkBuildDbg_OnTouch( checked )
{
	if( !checked ) chkObfuscate.SetChecked( true );
}


function isValid(str){
 return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}

//Handle build APK/AAB 'OK' click.
function btnBuildOK_OnTouch()
{
	//Check package name is ok.
	var pkgName = txtApkPkg.GetText();
	var ret = pkgName.match( RegExp("(^|\\.)\\d","gim"), "" );
	if( ret ) { app.Alert( "Package name parts cannot start with numbers", "Name Error" ); return; }
	if( !isValid(pkgName) || pkgName.indexOf(" ")>-1 ) {
		app.Alert( "Package name cannot contain spaces or symbols", "Name Error" ); return; }
	if( pkgName.match(/[^\x00-\x7F]/g,"") )  {
        app.Alert( "Package name cannot contain non-latin characters", "Name Error" ); return; }

	//Check version num is ok.
	var pkgVer = parseFloat( txtApkVer.GetText().replaceAll(",",".") )
	if( isNaN( pkgVer ) ) { app.Alert( "Version number must be a decimal fraction", "Version Error" ); return; }

	//Get debug mode and assets mode.
	debugApk = chkBuildDbg.GetChecked();
	useApkAssets = chkApkAssets.GetChecked();
	obfuscate = chkObfuscate.GetChecked();

	//Check if we have a release key store file.
	keyFile = "/storage/emulated/0/DroidScript/APKs/user.keystore";
	keyFileDbg = "/storage/emulated/0/.DroidScript/debug.keystore";
	if( !debugApk && !app.FileExists( keyFile ) ) { ShowKeyStoreDialog(); return; }

    //Warn about incrementing version number with NodeJS apps.
    if( HasOption("node") ) {
        alert("Warning: You should increment your app version number when building Node projects!" )
    }

	//Build the APK/AAB.
	remoteBuild = false
	if( debugApk && !g_aab ) BuildPackage( txtApkPkg.GetText(), curProgram, pkgVer, obfuscate, "android" );
	else ShowPasswordDialog();

	//Save organisation, packagename and version num.
	var org = txtApkPkg.GetText();
	org = org.substr( 0, org.lastIndexOf(".") );
	app.SaveText( "_userOrg", org, "spremote" );
	app.SaveText( curProgram+"_pkgName", pkgName, "spremote" );
	app.SaveText( pkgName+"_version", pkgVer, "spremote" );

	//Remove dialog.
	dlgApk.Dismiss();
}

//Handle APK 'Cancel' click.
function btnBuildCancel_OnTouch()
{
	//Remove dialog.
	dlgApk.Dismiss();
}

//Allow user to create key store.
function ShowKeyStoreDialog()
{
	//Create dialog window.
	dlgKey = app.CreateDialog( "Create Key" );
	dlgKey.SetBackColor( "#2E3134" );
	layKey = app.CreateLayout( "linear", "vertical,fillxy" );
	layKey.SetPadding( 0.05, 0, 0.05, 0 );

	//Create info text.
	var info = "You must create a personal key to sign your APK/AAB" +
		" files. Please enter a name, organization and password to " +
		"generate your key.";
	txtKeyInfo = app.CreateText( info, 0.8, -1, "multiline" );
	txtKeyInfo.SetMargins( 0,0.04,0,0.04 );
	txtKeyInfo.SetTextSize( 16 );
	layKey.AddChild( txtKeyInfo );

	//Create 'Name' text box.
	txtKeyName = app.CreateTextEdit( "MyName", 0.6 );
	layKey.AddChild( txtKeyName );

	//Create 'Organization' text box.
	txtKeyOrg = app.CreateTextEdit( "MyOrganization", 0.6 );
	layKey.AddChild( txtKeyOrg );

	//Create 'Password' text box.
	txtKeyPass = app.CreateTextEdit( keyPass, 0.6 );
	layKey.AddChild( txtKeyPass );

	//Create horizontal layout for Ok and Cancel buttons.
	layKey2 = app.CreateLayout( "linear", "horizontal,fillxy,center" );
	layKey.AddChild( layKey2 );

	//Create OK button.
	layKey2.SetMargins( 0, 0.02, 0, 0.01 );
	btnKeyOK = app.CreateButton( "OK", 0.2 );
	btnKeyOK.SetOnTouch( btnKeyOK_OnTouch );
	layKey2.AddChild( btnKeyOK );

	//Create Cancel button.
	btnKeyCancel = app.CreateButton( "Cancel", 0.2 );
	btnKeyCancel.SetOnTouch( btnKeyCancel_OnTouch );
	layKey2.AddChild( btnKeyCancel );

	//Add dialog layout and show dialog.
	dlgKey.AddLayout( layKey );
	dlgKey.Show();
}

//Handle Key dialog 'OK' click.
function btnKeyOK_OnTouch()
{
	//Get user key info.
	var name = txtKeyName.GetText();
	var org = txtKeyOrg.GetText();

	//Make sure APK's folder exists.
	var apkFldr = app.GetPath()+"/APKs";
	app.MakeFolder( apkFldr );

	//Create a user key store file and key.
	app.ShowProgress("Creating key...");
	zip = app.CreateZipUtil();
	zip.CreateKey( keyFile, txtKeyPass.GetText(), name, org );
	app.HideProgress();

	//Show warning.
	var warn = "A 'user.keystore' file has now been created in the " +
		"DroidScript/APKs folder.\n\nIt is STRONGLY recomended that you " +
		"backup this file. You cannot update Google Play Apps released using " +
		"this key, unless you have the original file (and can also " +
		"remember the password!)\n\n" +
		"Note: If you rename or delete this file, you will be asked to " +
		"create a new one again.";
	app.Alert( warn, "WARNING" );

	//Save current password to memory.
	keyPass = txtKeyPass.GetText();

	//Save user org to settings.
	app.SaveText( "_userOrg", "com."+txtKeyOrg.GetText(), "spremote" );

	//Remove dialog.
	dlgKey.Dismiss();
	dlgKey.Release();
}

//Handle Key dialog 'Cancel' click.
function btnKeyCancel_OnTouch()
{
	 //Remove dialog.
	dlgKey.Dismiss();
	dlgKey.Release();
}

//Show the APK password dialog.
function ShowPasswordDialog()
{
	//Create dialog window.
	dlgPass = app.CreateDialog( "Enter Key Password" );
	dlgPass.SetBackColor( "#2E3134" );
	layPass = app.CreateLayout( "linear", "vertical,fillxy" );
	layPass.SetPadding( 0.05, 0.05, 0.05, 0 );

	//Create 'Password' text box.
	txtPass = app.CreateTextEdit( keyPass, 0.6 );
	layPass.AddChild( txtPass );

	//Create horizontal layout for Ok and Cancel buttons.
	layPass2 = app.CreateLayout( "linear", "horizontal,fillxy,center" );
	layPass.AddChild( layPass2 );

	//Create OK button.
	layPass2.SetMargins( 0, 0.02, 0, 0.01 );
	btnPassOK = app.CreateButton( "OK", 0.24 );
	btnPassOK.SetOnTouch( btnPassOK_OnTouch );
	layPass2.AddChild( btnPassOK );

	//Create Cancel button.
	btnPassCancel = app.CreateButton( "Cancel", 0.24 );
	btnPassCancel.SetOnTouch( btnPassCancel_OnTouch );
	layPass2.AddChild( btnPassCancel );

	//Add dialog layout and show dialog.
	dlgPass.AddLayout( layPass );
	dlgPass.Show();
}

//Handle Pass dialog 'OK' click.
function btnPassOK_OnTouch()
{
	//Build the APK.
	BuildPackage( txtApkPkg.GetText(), curProgram, parseFloat(txtApkVer.GetText().replaceAll(",",".")),
					obfuscate, txtPass.GetText() );
	//Remove dialog.
	dlgPass.Dismiss();
	dlgPass.Release();
}

//Handle Pass dialog 'Cancel' click.
function btnPassCancel_OnTouch()
{
	//Remove dialog.
	dlgPass.Dismiss();
	dlgPass.Release();
}

//Create APK plugin (if not created yet).
function LoadApkBuilder()
{
    if( !plgApk )
    {
        _LoadPlugin( "ApkBuilder" );
        plgApk = app.CreateObject( "ApkBuilder" );
        if( plgApk==null ) return null;

        var privDir = app.GetPrivateFolder( "Plugins" );
        _LoadScriptSync( privDir+"/apkbuilder/Uglify/minify.js" )
        _LoadScriptSync( privDir+"/apkbuilder/Uglify/utils.js")
        app.UpdateProgressBar( 1 );
        _LoadScriptSync( privDir+"/apkbuilder/Uglify/ast.js")
        _LoadScriptSync( privDir+"/apkbuilder/Uglify/parse.js")
        _LoadScriptSync( privDir+"/apkbuilder/Uglify/transform.js")
        app.UpdateProgressBar( 2 );
        _LoadScriptSync( privDir+"/apkbuilder/Uglify/scope.js")
        _LoadScriptSync( privDir+"/apkbuilder/Uglify/output.js")
        app.UpdateProgressBar( 3 );
        _LoadScriptSync( privDir+"/apkbuilder/Uglify/compress.js")
        _LoadScriptSync( privDir+"/apkbuilder/Uglify/propmangle.js")
        app.UpdateProgressBar( 4 );

        if( plgApk.GetVersion() < app.GetVersion() ) {
            alert( "Warning: Your APK builder is out of date, new features may not work!" ); /*return null;*/ }
    }
    return plgApk
}

//Build the APK or AAB file.
function BuildPackage( packageName, appName, version, minify, pass )
{
	try
	{
		//Show progress dialog.
		_Dbg( "Building "+(debugApk?"debug ":"")+(g_aab?"AAB":"APK")+"..." )
		app.ShowProgressBar( "Building "+(g_aab?"AAB":"APK")+"...", 0, isChrome?"light":"" );

        //Read build.json file.
        var buildOps = ReadBuildFile()

		//Create APK plugin (if not created yet).
		plgApk = LoadApkBuilder()
		if( plgApk==null ) return;
        app.UpdateProgressBar( 5 );

		//Get path of base unsigned, unmanifested apk/aab and temp folder.
		var apkFldr = app.GetPath()+(g_aab?"/AABs":"/APKs");
		var tmpFldr = app.GetPrivateFolder( "temp" );
		var appFldr = app.GetPath()+"/"+appName;
		var privDir = app.GetPrivateFolder( "Plugins" );
		var plgDir = privDir+"/apkbuilder";

        //Save SPK with version name.
        CreatePackage( appName, "/storage/emulated/0/DroidScript/SPKs", version );

		//Deal with V2 apps (material look).
		options = "Launch" + (debugApk?",debug":"");
		if( !HasPkgFile() ) options += (options?",":"") + "holo";

		//Create output apk/aab file.
		var zipOut = app.CreateZipUtil();
		zipOut.Create( tmpFldr+"/package"+(g_aab?".aab":".apk") );

		//Open base template file.
		var zipIn = app.CreateZipUtil();
		zipIn.Open( plgDir+ (g_aab?"/aab.zip":"/apk.zip") );

		//Scan main file for permissions/options etc.
		permissions = ""; plugins = "";
		var ext = (isPython?".py":(isHtml?".html":".js"))
		ScanFile( appFldr+"/"+appName + ext )

        //Update progress
        app.UpdateProgressBar( 10 );

		//Add appropriate libs from apkbuilder.
		//if( app.IsTV() || HasOption("threads") || HasOption("nodom") )
		//	zipOut.AddFile( "lib/armeabi-v7a/libj2v8_android_armv7l.so", plgDir+"/lib/libj2v8_android_armv7l.so" );
		//if( options.indexOf("GLES")>-1 )
		//	zipOut.AddFile( "lib/armeabi-v7a/libglesjs.so", plgDir+"/lib/libglesjs.so" );

		//Add new app icon.png file.
		if( app.FileExists( appFldr+"/Img/"+appName+".png" ) ) {
			//zipOut.AddFile( (g_aab?"base/":"")+"res/drawable-xhdpi-v4/icon.png", appFldr+"/Img/"+appName+".png" );
			zipOut.AddFile( (g_aab?"base/res/drawable-xhdpi-v4/icon.png":"res/4d.png"), appFldr+"/Img/"+appName+".png" );
		}
		else if( app.FileExists( appFldr+"/Img/app-icon.png" ) ) {
            //zipOut.AddFile( (g_aab?"base/":"")+"res/drawable-xhdpi-v4/icon.png", appFldr+"/Img/app-icon.png" );
            zipOut.AddFile( (g_aab?"base/res/drawable-xhdpi-v4/icon.png":"res/4d.png"), appFldr+"/Img/app-icon.png" );
        }
		else {
			app.CopyFile( "/Sys/Img/Icon.png", tmpFldr+"/Icon.png" );
			//zipOut.AddFile( "res/drawable/icon.png", tmpFldr+"/Icon.png" );
			//zipOut.AddFile( (g_aab?"base/":"")+"res/drawable-xhdpi-v4/icon.png", tmpFldr+"/Icon.png" );
			zipOut.AddFile( (g_aab?"base/res/drawable-xhdpi-v4/icon.png":"res/4d.png"), tmpFldr+"/Icon.png" );
		}

		//Add user's files (and scan for permissions/options).
		var noSwap = options.includes("NoSwapify");
		var err = AddFolderWithScan( zipOut, (g_aab?"base/":"")+"assets/user", appFldr,
		        appName, minify, true, noSwap, false, buildOps );
		if( err ) { zipIn.Close(); zipOut.Close(); return; }

		//Loop through adding rest of base apk/aab contents.
		var lst = zipIn.List().split(",");
		for( var i=0; i<lst.length; i++ )
		{
			//Get file extension and check for app.js file etc.
			var ext = lst[i].substr( lst[i].lastIndexOf(".") ).toLowerCase();
			var isMin = ( lst[i].toLowerCase().indexOf(".min.js") > -1 );
			var isJs = ( ext==".js" );
			var isPy = ( ext==".py" );
			var isHtm = ( ext==".html" || ext==".htm" );
			var isAppJs = ( lst[i].indexOf((g_aab?"base/":"")+"assets/app.js")==0 );

			//Exclude default '/Sys' assets if not required.
			if( !useApkAssets ) {
				if( lst[i].startsWith((g_aab?"base/":"")+"assets/Html/") ) continue;
				else if( lst[i].startsWith((g_aab?"base/":"")+"assets/Img/") ) continue;
				else if( lst[i].startsWith((g_aab?"base/":"")+"assets/Snd/") ) continue;
			}

			//Exclude various assets if not required.
			//if( !options.includes("Hybrid") && lst[i].startsWith((g_aab?"base/":"")+"assets/UI/") ) continue;
			if( !options.includes("Python") && lst[i].startsWith((g_aab?"base/":"")+"assets/python/") ) continue;
			if( !options.includes("MUI") && lst[i].startsWith((g_aab?"base/":"")+"assets/fonts/mui/") ) continue;
			if( !options.includes("MUI") && lst[i].startsWith((g_aab?"base/":"")+"assets/mui.js") ) continue;

			//Exclude various libs if not required.
			if( !options.includes("Fast") && lst[i].includes("/libj2v8.so") ) continue;
			if( !options.includes("GLView") && lst[i].includes("/libFastCanvasJNI.so") ) continue;

			if( g_aab ) {
			    if( lst[i].includes("base/manifest/AndroidManifest.xml") ) continue
			    else if( lst[i].includes("base/assets.pb") ) continue
			    //else if( lst[i].includes("base/res/drawable-xhdpi-v4/icon.png") ) continue
			}
			//else if( lst[i].includes("res/drawable-xhdpi/icon.png") ) continue

			//Extract file from source zip.
			zipIn.Extract( lst[i], tmpFldr+"/tmp.dat" );

			//Process base files.
			if( minify && (isJs||isPy||isHtm) && !isMin ) {
				var code = app.ReadFile( tmpFldr+"/tmp.dat" );
				if( !noSwap ) code = Swapify( code, isAppJs );
				app.WriteFile( tmpFldr+"/tmp.dat", code );
			}
			//Add to dest zip.
			zipOut.AddFile( lst[i], tmpFldr+"/tmp.dat" );

			//Update progress.
			app.UpdateProgressBar( 50 + (i*50/lst.length) );
		}

		//Loop through adding required plugins.
		var plugDir = app.GetPrivateFolder( "Plugins" );
		var plugNames = plugins.split(",");
		for( var i=0; plugins!="" && i<plugNames.length; i++ )
		{
			var name = plugNames[i];
			var nameLow = plugNames[i].toLowerCase();

			//Add each plugin file found at top level.
			var plugFiles = app.ListFolder( plugDir+"/"+nameLow,"");
			for( var p=0; p<plugFiles.length; p++ )
			{
				var plugFileName = plugFiles[p];
				var plugFilePath = plugDir+"/"+nameLow+"/"+plugFileName;

                //Ignore plugin docs.
                if( plugFileName=="docs" ) continue;
                if( plugFileName == name+'.html') continue;

                //Allow sub-folders (for .so files and assets).
                if( app.IsFolder( plugFilePath ) ) {
                    AddFolder( zipOut, (g_aab?"base/":"")+"assets/plugins/"+nameLow+"/"+plugFileName, plugFilePath, true );
                    continue;
                }

				//Get file type.
				var ext = plugFileName.substr( plugFileName.lastIndexOf(".") ).toLowerCase();
				var isMin = ( plugFileName.toLowerCase().indexOf(".min.js") > -1 );
				var isNode = ( plugFileName=="Node.inc" );
				var isJs = ( ext==".js" );
				var isInc = ( ext==".inc" );

				//Minify .inc and .js files.
				if( !isMin && (isInc || isJs) )
				{
					var code = app.ReadFile( plugFilePath );
					if( minify && !noSwap ) code = Swapify( code, false );
					zipOut.AddText( (g_aab?"base/":"")+"assets/plugins/"+nameLow+"/"+plugFileName, code );
				}
				else zipOut.AddFile( (g_aab?"base/":"")+"assets/plugins/"+nameLow+"/"+plugFileName, plugFilePath );

				if( !isMin && !isNode && (isInc || isJs) ) ScanFile( plugFilePath );
			}
		}

		//Add options file.
		zipOut.AddText( (g_aab?"base/":"")+"assets/ops", options.toLowerCase() );

        if( g_aab )
        {
            //Extract manifest file and assets file from template aab file.
            zipIn.Extract( "base/manifest/AndroidManifest.xml", tmpFldr+"/AndroidManifest.pb" );
            zipIn.Extract( "base/assets.pb", tmpFldr+"/assets.pb" );

            //Update the files using NodeJS.
            UpdateAABFiles( appFldr, tmpFldr, plgDir, packageName, appName, version, permissions, options, useApkAssets )

            //Add updated files to output zip.
            zipOut.AddFile( "base/manifest/AndroidManifest.xml", tmpFldr+"/AndroidManifest.pb.new" );
            zipOut.AddFile( "base/assets.pb", tmpFldr+"/assets.pb.new" );
        }
        else {
    		//Add new manifest file using template.
    		plgApk.UpdateManifest( privDir+"/apkbuilder/amf.dat", tmpFldr+"/tmp.dat",
    					packageName, appName, version, permissions, appFldr, options );
    		zipOut.AddFile( "AndroidManifest.xml", tmpFldr+"/tmp.dat" );
        }

		//Close zip files.
		zipIn.Close();
		zipOut.Close();

        if( g_aab )
        {
            app.MakeFolder( apkFldr )
            var aab = apkFldr+"/"+appName.replaceAll(" ","_")+"_"+version+".aab"
            var err = plgApk.SignAPK( tmpFldr+"/package.aab", aab, keyFile, "alias_name", pass, pass )
            if( err ) { if( remoteBuild ) _Dbg("Bad Password or Key file!"); else app.Alert( "Bad Password or Key file!", "Error" ); return; }
            app.DeleteFile( tmpFldr+"/package.aab" );
            if( !headless && !remoteBuild ) alert( "AAB created in folder:\n\n /DroidScript/AABs" )
            _Dbg( "AAB created in folder: /DroidScript/AABs"  )
        }
        else
        {
    		//Create a debug key store if required.
    		if( !app.FileExists( keyFileDbg ) ) zipOut.CreateDebugKey( keyFileDbg );

    		//Sign APK.
    		app.MakeFolder( apkFldr );
    		var apk =  apkFldr+"/"+appName.replaceAll(" ","_")+"_"+version+".apk";
    		var err = plgApk.SignAPK( tmpFldr+"/package.apk", apk,
    		            debugApk?keyFileDbg:keyFile, debugApk?"androiddebugkey":"alias_name", pass, pass )
    		if( err ) { if( remoteBuild ) _Dbg("Bad Password or Key file!"); else app.Alert( "Bad Password or Key file!", "Error" ); return; }
    		app.DeleteFile( tmpFldr+"/package.apk" );

    		//Show completion message.
    		if( _isGPlay ) {
    		    alert( "APK created in folder:\n\n /DroidScript/APKs" )
    		}
    		else {
    		    _Dbg( "APK created in folder: /DroidScript/APKs" )
    		    if( !headless && !remoteBuild ) {
                    var msg = "APK created in folder:\n\n /DroidScript/APKs\n\nInstall and Run now?"
                    var yesNoInst = app.CreateYesNoDialog( msg );
                    yesNoInst.SetOnTouch( function(res){yesNoInst_OnTouch(res,apk)} );
                    yesNoInst.Show();
                }
    		}
        }
	}
	finally {
		//Hide progess dialog.
		app.HideProgressBar();
	}
}

//Update AAB manifest and asset files using NodeJS.
function UpdateAABFiles( appFldr, tmpFldr, plgDir, packageName, appName, version, perms, ops, useAssets )
{
    //Run script.
    node.Run( plgDir+"/node_aab.js", "aab" )
    while( !node.IsDone() ) app.Wait( 1, true )

    //Modify manifest.
    var options = {}
    options.protoFile = plgDir + '/proto/Resources.proto'
    options.manifestFile = tmpFldr + "/AndroidManifest.pb"
    options.jsonFile = tmpFldr + '/AndroidManifest.json'
    options.output = options.manifestFile+".new"
    options.buildFile = app.RealPath(appFldr) + '/build.json'

    options.oldPackageName = "com.smartphoneremote.androidscriptfree"
    options.newPackageName = packageName
    options.label = appName
    options.newVersion = version
    options.permissions = perms.split(",")
    options.options = ops.split(",")
    node.Execute( "modManifest( " + JSON.stringify(options) + ")", "aab" )
    while( !node.IsDone() ) app.Wait( 1, true )

    //Give some time for file to become available.
    app.Wait( 1, true )

    //Modify assets list.
    var options = {}
    options.protoFile = plgDir + '/proto/files.proto'
    options.assetsFile = tmpFldr + '/assets.pb'
    options.jsonFile = tmpFldr + '/assets.json'
    options.output = options.assetsFile+".new"
    options.assetFilters = ["assets/edit","assets/samples","assets/sdcard",
        "assets/sdk","assets/esp","assets/templates","assets/demos","assets/ide"]
    if( !useAssets ) options.assetFilters = options.assetFilters.concat(["assets/Html","assets/Img","assets/Snd"])
    //if( !ops.includes("Hybrid") ) options.assetFilters = options.assetFilters.concat(["assets/UI"])
    if( !ops.includes("Python") ) options.assetFilters = options.assetFilters.concat(["assets/python"])
    if( !ops.includes("MUI") ) options.assetFilters = options.assetFilters.concat(["assets/fonts/mui","assets/mui.js"])

    app.DeleteFile( options.output )
    node.Execute( "modAssets( " + JSON.stringify(options) + ")", "aab" )
    while( !node.IsDone() ) app.Wait( 1, true )

    //Give some extra time for file to become available/visible in file system.
    while( !app.FileExists(options.output) ) app.Wait( 1, true )
}

//APK complete/install dialog.
function yesNoInst_OnTouch( result, apkFile )
{
	if( result=="Yes" ) {
		if( app.FileExists( apkFile ) )
			//app.OpenFile( apkFile, "application/vnd.android.package-archive" );
			app.InstallApp( apkFile, onAppInstall );
		else app.ShowPopup( "APK file '" + apkFile + "' does not exist!" );
	}
}

//Handle apk install completion.
function onAppInstall( pkgName, status )
{
	if( status=="SUCCESS" ) app.LaunchApp( pkgName, true )
	else app.Alert( status, pkgName )
}

//Recursively add folder contents to zip.
function AddFolderWithScan( zip, name, fldr, appName, minify, isTop, noSwap, progress, buildOps )
{
	var list = app.ListFolder( fldr,"");
	for( var i=0; i<list.length; i++ )
	{
		var title = list[i];
		var titleNoExt = title.substring( 0, title.lastIndexOf(".") )
		var srcFile = fldr+"/"+title;
		var relPath = srcFile.replace( app.GetPath()+"/"+appName+"/", "" )

		//Update progress (special case for node_modules cos it takes ages)
        if( progress ) app.UpdateProgressBar( (10 + 40*i)/ list.length );

		if( !app.IsFolder( srcFile ) )
		{
			//Get file type.
			var ext = title.substr( title.lastIndexOf(".") ).toLowerCase();
			var isMin = ( title.toLowerCase().indexOf(".min.js") > -1 );
			var isJs = ( ext==".js" );
			var isPy = ( ext==".py" );
			var isHtm = ( ext==".html" || ext==".htm" );
			var forceMin = buildOps.obfuscate ? buildOps.obfuscate.includes( relPath ) : false
			var hybrid = options.includes("Hybrid")
			var python = options.includes("Python")

			//Scan .js and .html files for permissions.
			if( isTop && !isMin && (isJs || isHtm) ) ScanFile( srcFile );

			//Swap spaces for underscores (for ICS bug)
			var newtitle = title;
			newtitle = newtitle.replace( RegExp( " ","gim"), "_" );

			//Swap main file name (cos zip signer does not cope with multi-byte chars)
			if( isTop && (isJs || isHtm || python) && titleNoExt.replace("~","")==appName )
			    newtitle = ((hybrid||python)?"~":"")+"_main_"+ext;

            //Check for non-latin files (zip util and/or signer can't cope yet)
            if( newtitle.match(/[^\x00-\x7F]/g,"") ) {
                app.Alert( "Cannot build packages containing non-latin file names!", "Error" );
                return true;
            }

			//Add file to zip with optional obfuscation and macros.
			if( isTop || forceMin )
			{
				//Do build-time macro substitutions.
				var code = app.ReadFile( fldr+"/"+title );
				code = Macros( code, newtitle, appName );

				//Minify and obfuscate if required.
				if( minify && (isJs || isHtm || isPy) && !isMin || forceMin ) {
					if( !noSwap ) code = Swapify( code, false );
					if( isJs ) code = Uglify( title, code );
				}
				zip.AddText( name+"/"+newtitle, code );
			}
			else zip.AddFile( name+"/"+newtitle, srcFile );
		}
		else {
			var err = AddFolderWithScan( zip, name+"/"+title, fldr+"/"+title, appName, minify,
			    false, noSwap, title=="node_modules", buildOps );
			if( err ) return true;
		}
	}
}

//Do build-time macro substitutions.
function Macros( code, fileTitle, appTitle )
{
	code = code.replace( RegExp( "__BUILD_TIME__","gim"), new Date().getTime() );
	if( fileTitle=="~_main_.html" ) code = code.replace( RegExp( appTitle,"gim"), "~_main_" );
	return code;
}

//Scan a file for required Android permissions. options and plugins.
function ScanFile( file, dangerOnly )
{
	var src = app.ReadFile( file );
	if( !src ) return

	//Ide commands.
	if( src.includes(".MakePlugin") ) makePlugin = true; 
	
	//Options.
	if( src.indexOf("cfg."+"Game") > -1 ) AddOption("Game");
	if( src.indexOf("cfg."+"Fast") > -1 ) AddOption("Fast");
	if( src.indexOf("cfg."+"NodeESM") > -1 ) AddOption("NodeESM");
	else if( src.indexOf("cfg."+"Node") > -1 ) AddOption("Node");
	if( src.indexOf("cfg."+"Transparent") > -1 ) AddOption("Transparent");
	if( src.indexOf("cfg."+"Landscape") > -1 ) AddOption("Landscape");
	if( src.indexOf("cfg."+"Portrait") > -1 ) AddOption("Portrait");
	if( src.indexOf("cfg."+"Share") > -1 ) AddOption("Share");
	if( src.indexOf("cfg."+"USB") > -1 ) AddOption("USB");
	if( src.indexOf("cfg."+"GLES") > -1 ) AddOption("GLES");
	if( src.indexOf("cfg."+"Light") > -1 ) AddOption("Light");
	if( src.indexOf("cfg."+"Dark") > -1 ) AddOption("Dark");
	if( src.indexOf("cfg."+"Holo") > -1 ) AddOption("Holo");
	if( src.indexOf("cfg."+"MUI") > -1 ) AddOption("MUI");
	if( src.indexOf("cfg."+"NoSwapify") > -1 ) AddOption("NoSwapify");
	if( src.indexOf("cfg."+"Legacy") > -1 ) AddOption("Legacy");
	if( src.indexOf("cfg."+"Hybrid") > -1 ) AddOption("Hybrid");
	if( src.match(/class\s*?Main\s*?\s*?extends\s*?App/i) ) AddOption("Hybrid");
    if( src.match(/from\s*?native\s*?\s*?import\s*?/i) ) AddOption("Python");
    if( src.match(/from\s*?hybrid\s*?\s*?import\s*?/i) ) { AddOption("Python"); AddOption("Hybrid"); }
    if( src.indexOf("cfg."+"Serv") > -1 ) AddOption("Serv");
    if( src.indexOf("cfg."+"ESM") > -1 ) AddOption("ESM");
    if( src.indexOf("cfg."+"Console") > -1 ) AddOption("Console");
    if( src.indexOf("cfg."+"Persist") > -1 ) AddOption("Persist");
    if( src.indexOf("cfg."+"TV") > -1 ) AddOption("TV");
    if( src.indexOf("cfg."+"NDEF") > -1 ) AddOption("NDEF");

	if( !dangerOnly )
	{
	    if( src.indexOf("app.SetAutoBoot") > -1 ) AddOption("Boot");
        if( src.indexOf("app.ScheduleJob") > -1 ) AddOption("Boot");
	    if( src.indexOf("app.CreateBeaconManager") > -1 ) AddOption("Beacon");
	    if( src.indexOf("app.CreateWallpaper") > -1 )  AddOption("Wallpaper");
	    if( src.indexOf("app.CreateNotification")> -1 && src.indexOf(".Listen")> -1 ) AddOption("NotifyService");
        if( src.indexOf("app.ScheduleJob") > -1 ) AddOption("Job");
		if( src.indexOf("app.GetShared") > -1 ) AddOption("Share");
		if( src.indexOf("app.CreateUSBSerial") > -1 ) AddOption("USB");
		if( src.indexOf("app.CreateGLView") > -1 ) AddOption("GLView");
		if( src.indexOf("app.CreateGameView") > -1 && src.indexOf("gles")>-1 ) AddOption("GLES");
	}

	//Permissions.
	if( !dangerOnly )
	{
		if( src.indexOf("app.CreateNetClient") > -1 ) AddPermission("Network");
		else if( src.indexOf("XMLHttpRequest") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.GetIPAddress") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.GetMacAddress") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.GetSSID") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.CreateWebServer") > -1 ) AddPermission("Network");
		else if( src.indexOf("new WebSocket") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.CreateEmail") > -1 ) AddPermission("Network");
		else if( src.indexOf("\"http://") > -1 ) AddPermission("Network");
		else if( src.indexOf("\"https://") > -1 ) AddPermission("Network");
		else if( src.indexOf("\"rtsp://") > -1 ) AddPermission("Network");
		else if( src.indexOf("\"ftp://") > -1 ) AddPermission("Network");
		else if( src.indexOf("'http://") > -1 ) AddPermission("Network");
		else if( src.indexOf("'https://") > -1 ) AddPermission("Network");
		else if( src.indexOf("'rtsp://") > -1 ) AddPermission("Network");
		else if( src.indexOf("'ftp://") > -1 ) AddPermission("Network");
		else if( src.indexOf("GoProController") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.SetWifiEnabled") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.IsWifiEnabled") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.WifiConnect") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.SetOnWifiChange") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.IsConnected") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.SetWifiApEnabled") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.IsWifiApEnabled") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.ChooseWifi") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.WifiScan") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.CreateAdView") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.CreateCloudStore") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.CreateNode") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.DownloadFile") > -1 ) AddPermission("Network");
		else if( src.indexOf("app.CreateDownloader") > -1 ) AddPermission("Network");

		if( src.indexOf("app.PreventScreenLock") > -1 ) AddPermission("WakeLock");
		if( src.indexOf("app.PreventWifiSleep") > -1 ) AddPermission("WakeLock");
		if( src.indexOf("app.Unlock") > -1 ) AddPermission("Unlock");

		if( src.indexOf("app.CreateShortcut") > -1 ) AddPermission("Shortcut");
		if( src.indexOf("app.Vibrate") > -1 ) AddPermission("Vibrate");
		if( src.indexOf("gfx.Vibrate") > -1 ) AddPermission("Vibrate");
		if( src.indexOf("app.CheckLicense") > -1 ) AddPermission("License");

		if( src.indexOf("app.SetMockLocation") > -1 ) AddPermission("MockLoc");

		//if( src.indexOf("FingerPrint") > -1 ) AddPermission("Biometric");
		if( src.match(/.*?app.CreateNotification\(.*?FullScreen.*?\)/i) ) AddPermission("FullIntent");
	}

    if( src.indexOf("app.CreateNxt") > -1 ) AddPermission("Bluetooth");
    if( src.indexOf("app.IsBluetoothOn") > -1 ) AddPermission("Bluetooth");
    if( src.indexOf("app.CreateBluetoothSerial") > -1 ) { AddPermission("Bluetooth"); AddPermission("Location"); }
    if( src.indexOf("app.SetBluetoothEnabled") > -1 ) AddPermission("Bluetooth");
    if( src.indexOf("app.IsBluetoothEnabled") > -1 ) AddPermission("Bluetooth");
    if( src.match(/.*?app.CreateIOIO\(\s*?"Bluetooth"\s*?\).*?/i) ) AddPermission("Bluetooth");

	if( src.indexOf("app.CreateCameraView") > -1 ) AddPermission("Camera");
	if( src.indexOf("app.AddCameraView") > -1 ) AddPermission("Camera");
	if( src.indexOf("app.CreateLocator") > -1 ) AddPermission("Location");
	if( src.indexOf("app.CreateMicroBit") > -1 ) AddPermission("Location");
	if( src.indexOf("app.CreateBluetoothLE") > -1 ) { AddPermission("Location"); AddPermission("Bluetooth"); }
	if( src.indexOf("app.CreatePuckJS") > -1 ) AddPermission("Location");
	if( src.indexOf("app.ChooseWifi") > -1 ) AddPermission("Location");
	if( src.indexOf("app.WifiScan") > -1 ) AddPermission("Location");
	if( src.indexOf("app.CreateBluetoothList") > -1 ) { AddPermission("Location"); AddPermission("Bluetooth"); }

	if( src.indexOf("app.Create"+"SMS") > -1 ) AddPermission("SMS");
	if( src.indexOf("content://com.android.calendar") > -1 ) AddPermission("Calendar");

	if( src.indexOf("app.CopyFile") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.CopyFolder") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.CreateAudioRecorder") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.CreateFile") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.CreateMediaStore") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.CreateDownloader") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.DeleteFile") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.DeleteFolder") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.FileExists") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.FolderExists") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.GetExternalFolder") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.IsFolder") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.ListFolder") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.MakeFolder") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.OpenFile") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.ReadFile") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.RenameFile") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.RenameFolder") > -1 ) AddPermission("Storage");
	else if( src.indexOf("app.WriteFile") > -1 ) AddPermission("Storage");
	else if( src.indexOf(".TakePicture") > -1 ) AddPermission("Storage");
	else if( src.indexOf(".SetFile") > -1 ) AddPermission("Storage");			//for VideoView.SetFile().
	else if( src.indexOf("app.CreateEmail") > -1 ) AddPermission("Storage"); //Needed for attachments.
	else if( src.match(/'file:\/\/(?!\/android_asset)/) ) AddPermission("Storage");
    else if( src.match(/"file:\/\/(?!\/android_asset)/) ) AddPermission("Storage");
	
	if( src.indexOf("app.CreateContacts") > -1 ) AddPermission("Contacts");
	if( src.indexOf("content://com.android.contacts") > -1 ) AddPermission("Contacts");

	if( src.indexOf("app.CreateAudioRecorder") > -1 ) AddPermission("Record");
	if( src.indexOf("app.CreateSpeechRec") > -1 ) AddPermission("Record");
	if( src.indexOf("app.CreateCameraView") > -1 && src.indexOf(".Record") > -1 ) AddPermission("Record");

	if( src.indexOf("app.Call") > -1 ) AddPermission("Phone");
	if( src.indexOf("app.CreatePhoneState") > -1 ) AddPermission("Phone");

	if( src.indexOf("app.GetUser") > -1 ) { AddPermission("Accounts"); if( osVer>=26 ) { AddPermission("License"); AddPermission("Contacts") } }
	if( src.indexOf("app.GetAccounts") > -1 ) { AddPermission("Accounts"); if( osVer>=26 ) AddPermission("Contacts") }

	if( src.indexOf("app.CreateNotification") > -1 ) AddPermission("Notify");
	if( src.indexOf("app.QueryContent") > -1 ) AddPermission("Media");


	if( !dangerOnly )
	{
		if( src.indexOf("app.CreateSmartWatch") > -1 ) AddPermission("SmartWatch2");
		if( src.indexOf("app.CreatePlayStore") > -1 ) AddPermission("Vending");

		if( src.indexOf("app.SetRingerMode") > -1 ) AddPermission("Sounds");
		if( src.indexOf("app.SetVolume") > -1 ) AddPermission("Sounds");
		if( src.indexOf("app.SetSpeakerPhone") > -1 ) AddPermission("Sounds");
		if( src.indexOf("app.GetSpeakerPhone") > -1 ) AddPermission("Sounds");

		if( src.indexOf("app.SetAutoBoot") > -1 ) AddPermission("Boot");
		if( src.indexOf("app.ScheduleJob") > -1 ) AddPermission("Boot");

		if( src.indexOf("app.CreateOverlay") > -1 ) AddPermission("SysWin");
		if( src.indexOf("app.SetKioskMode") > -1 ) { AddPermission("SysWin"); AddPermission("Tasks") }
		if( src.indexOf("app.GoToSleep") > -1 ) AddPermission("Settings");
		if( src.indexOf("app.CreateWallpaper") > -1 ) AddPermission("Wallpaper");
		if( src.indexOf("vnd.android.package-archive") > -1 ) AddPermission("Install");
		if( src.indexOf("app.InstallApp") > -1 ) AddPermission("Install");
		if( src.indexOf(".SetInForeground") > -1 ) AddPermission("Service");
		if( src.indexOf("app.ToFront") > -1 ) AddPermission("Tasks");
		if( src.indexOf("app.GetInstalledApps") > -1 ) AddPermission("Packages");
		if( src.indexOf("app.IsAppInstalled") > -1 ) AddPermission("Packages");

	}

	//Add extra user options.
	var re = /_AddOptions\s*\( ?["|'](.*?)["|'] ?\)/g;
	while( match = re.exec(src) ) {
		var ops = match[1].split(",");
		for( i in ops ) AddOption( ops[i] );
	}

	//Add extra user permissions.
	var re = /_AddPermissions\s*\( ?["|'](.*?)["|'] ?\)/g;
	while( match = re.exec(src) ) {
		var perms = match[1].split(",");
		for( i in perms ) AddPermission( perms[i] );
	}

	//Remove user permissions.
	var re = /_RemovePermissions\s*\( ?["|'](.*?)["|'] ?\)/g;
	while( match = re.exec(src) ) {
		var perms = match[1].split(",");
		for( i in perms ) RemovePermission( perms[i] );
	}

	if( !dangerOnly )
	{
		//Add used internal plugins. 
		if( src.includes("app.CreateCustomTabs") ) AddPlugin( "CustomTabs" );
		if( src.includes("app.CreateNode") ) AddPlugin( "Node" );
		if( src.includes("cfg."+"Node") ) AddPlugin( "Node" );
		if( src.includes("cfg."+"Hybrid") ) AddPlugin( "UI" );
		if( src.match(/class\s*?Main\s*?\s*?extends\s*?App/i) ) AddPlugin( "UI" );
		if( src.match(/ui.addLayout/i) ) AddPlugin( "UI" );

		//Add used external plugins.
		var re = /app.LoadPlugin\s*\( ?["|'](.*?)["|'] ?\)/g;
		while( match = re.exec(src) ) AddPlugin( match[1] );

		//Add extra plugins.
		var re = /_AddPlugins\s*\( ?["|'](.*?)["|'] ?\)/g;
		while( match = re.exec(src) ) {
			var plugs = match[1].split(",");
			for( i in plugs ) AddPlugin( plugs[i] );
		}
	}
}

//Add a options (if not already added)
function AddOption( ops )
{
	if( options.indexOf( ops )==-1 ) {
		if( options ) options += ",";
		options += ops;
	}
}

//Add a permission (if not already added)
function AddPermission( perm )
{
	if( permissions.indexOf( perm )==-1 ) {
		if( permissions ) permissions += ",";
		permissions += perm;
	}
}

//Remove a permission.
function RemovePermission( perm ) {
	permissions = permissions.replace( perm, "" );
}

//Add a plugin to list (if not already added)
function AddPlugin( plugName )
{
	if( plugins.indexOf( plugName )==-1 ) {
		if( plugins ) plugins += ",";
		plugins += plugName;
	}
}

//Minify javascript code.
function Uglify( file, orig_code, options )
{
  try {
	  var res = minify( orig_code, {output:{ascii_only:true, hexify:true}} )
	  if( res.error ) throw res.error;
	  return res.code;
  }
  catch( e ) {
	alert( "Obfuscation error in " + file + ": " + e );
	return null;
	}
};

//Swap method names for numbers.
function Swapify( str, isInclude )
{
	var meths =  Object.getOwnPropertyNames(app).filter(function(property) {
		return typeof app[property] == 'function';
	});

	result = str.replace(/app\.(.*?)(\W|$)/g, function(m,p1,p2) {
		var i = meths.indexOf(p1);
		return "app."+ (i>-1&&p1!="Execute" ? "_"+i : p1) + p2;
	});

	if( isInclude )  {
		 result = result.replace(/this\.(.*?) = f/g, function(m,p1) {
			var i = meths.indexOf(p1);
			return "this."+ (i>-1&&p1!="Execute" ? "_"+i : p1) +" = f";
		});
	}
	return result;
}

//Convert a string to unicode escape sequences.
function ToUnicode( string )
{
	return string.replace(/[\s\S]/g, function (escape) {
	   return '\\u' + ('0000' + escape.charCodeAt().toString(16)).slice(-4);
	});
}

//Check for new updates etc.
function CheckForUpdates()
{
    updatesChecked = true;
    
	 try {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() { HandleReply(xmlhttp); };
		xmlhttp.open("POST", "http://www.androidscript.org/News/Version.php" );
		xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlhttp.send(JSON.stringify( {} ));
	}
	catch(e) {}

	//Nag user about Premium.
	if( !premium )
	{
		var month = new Date().getMonth();
		var nagMonth = app.LoadNumber( "NagMonth", -1 );
		if( nagMonth==-1 ) app.SaveNumber( "NagMonth", month );
		else if( nagMonth != month ) {
			app.SaveNumber( "NagMonth", month );
			alert( T("SupportPremium") );
			ShowPremium();
		}
	}
}

//Handle the servers reply (version number)
function HandleReply( xmlHttp )
{
	try
	{
		if( xmlHttp.readyState==4 )
		{
			//If we got a valid response.
			if( xmlHttp.status==200 )
			{
				//Check news version.
				var info = JSON.parse(xmlHttp.responseText);
				var lastVersion = app.LoadNumber( "_LastNewsVersion", 0, "spremote" );
				if( info.version > lastVersion ) {
					ShowNews();
					app.SaveNumber( "_LastNewsVersion", info.version, "spremote" );
				}
				
				//Load webstore.
				if( info.store ) {
					storeUrl = info.store;
					app.SaveText( "StoreUrl", storeUrl );
					//webStore.LoadUrl( storeUrl + "?type=spk&app=1&theme=" + (useDarkTheme?"dark" :"light") );
				}
			}
		}
	}
	catch(e){}
}

//Show the news dialog.
function ShowNews()
{
    return //too slow!

	//Create dialog window.
	dlgNews = app.CreateDialog( "News", "NoTitle" );
	if( !isChrome ) dlgNews.SetBackColor( "#2E3134" );
	layNews = app.CreateLayout( "linear", "vertical,fillxy" );
	if( isPortrait ) layNews.SetPadding( 0.03, 0.015, 0.03, 0.015 );
	else layNews.SetPadding( 0.015, 0.03, 0.015, 0.03 );

	//Create a web control.
	webNews = app.CreateWebView( isChrome?0.5:0.90, 0.75, "IgnoreErrors,UseBrowser,progress" );
	//webNews.SetMargins( 0, 0.01, 0, 0.01 );
	//webNews.SetOnProgress( webPlug_OnProgess );
	layNews.AddChild( webNews );
	//webNews.LoadHtml( "Loading News...", "file:///Sys/" );

	//Add dialog layout and show dialog.
	dlgNews.AddLayout( layNews );
	dlgNews.Show();

	//Load page
	setTimeout( LoadNews, 100 );
}

//Load the news
function LoadNews()
{
	var url = "http://androidscript.org/News/News.html";
	webNews.LoadUrl( url  );
}

//Show the shop dialog.
function ShowShop()
{
	//Create dialog window.
	dlgShop = app.CreateDialog( "Shop", "NoTitle" );
	if( !isChrome ) dlgShop.SetBackColor( "#2E3134" );
	dlgShop.EnableBackKey( false );
	dlgShop.SetOnBack( OnShopBack );

	layShop = app.CreateLayout( "linear", "vertical,fillxy" );
	if( isPortrait ) layShop.SetPadding( 0.01, 0.015, 0.01, 0.015 );
	else layShop.SetPadding( 0.015, 0.03, 0.015, 0.03 );

	//Create a web control.
	webShop = app.CreateWebView( isChrome?0.5:0.98, 0.8, "IgnoreErrors,scrollfade,progress" );
	//webShop.SetMargins( 0, 0.01, 0, 0.01 );
	webShop.SetOnProgress( webShop_OnProgess );
	layShop.AddChild( webShop );

	//Add dialog layout and show dialog.
	dlgShop.AddLayout( layShop );
	dlgShop.Show();

	//Load page
	setTimeout( LoadShop, 100 );
}

//Load the shop page.
function LoadShop()
{
	var url = "http://www.droidscript.org/shop";
	webShop.LoadUrl( url  );
}

//Handle back in shop dialog.
function OnShopBack()
{
	if( webShop.GetUrl().indexOf("/shop")<0 ) webShop.Back();
	else dlgShop.Dismiss();
}

//Show page load progress.
function webShop_OnProgess( progress )
{
	if( progress > 90 )
		HideWpHeaderAndFooter();
}

function HideWpHeaderAndFooter()
{
	var html = "var el = document.getElementsByTagName('header');"
	   + "for(var i=0; i<el.length; i++) el[i].style='display:none;visibility:hidden';";

	html += "el = document.getElementsByTagName('footer'); "
			+ "for(var i=0; i<el.length; i++) el[i].style.display='none';";

	html += "el = document.getElementsByClassName('breadcrumb-box text-left');"
			+ "for(var i=0; i<el.length; i++) el[i].style.display='none';";

	webShop.Execute( html );
}

//Get the users purchase status.
function GetPremiumStatus()
{
	playStore.GetPurchases( OnPremPurchases, "SUBS" );
}

//Show user's purchases.
function OnPremPurchases( items )
{
	for( var i=0; i<items.length; i++ ) {
		if( items[i].productId.includes("subs_premium") && items[i].purchaseState==0 ) premium = true;
		if( items[i].productId.includes("subs_premium_plus") && items[i].purchaseState==0 ) premiumPlus = true;
	}
	//Allow premium overrides.
	if( app.IsEngine() ) { premium = premiumPlus = true };
	if( app.FileExists( "/storage/emulated/0/DroidScript/_nopremium_") ) { premium = premiumPlus = false };

	if( !headless )
	{
		//Reset menus if premium.
		LoadMenus();

		//Relist samples if premium.
		//if( premium && !v3 ) lstSamp.SetList( GetSamples(), "\\|" );

		//Ask user to select language if user is not english speaking.
		if( app.IsNewVersion() && false )
		{
			var code = app.GetLanguageCode();
			if( code!="en" ) alert( T("SelectLang",code) );
		}

		//Start showing ads if not premium.
		if( premium ) { 
		    ads.Gone();
		    clearTimeout( tmrAds )
		    layLst.SetSize( 1, (!premium&&app.IsPortrait()?1-bannerHeight:1)-topBarHeight )
		    if(scrollIcons) scrollIcons.SetSize( 1, (!premium&&app.IsPortrait()?1-bannerHeight:1)-topBarHeight ); 
		}
		else setTimeout( function(){ads.Load()}, 3000 );

        //Show hidden overlay if option selected (and premium)
        if( premium && allowBackRun ) EnableOverlay()

		//Check for updates (once we know if user is premium).
		if( !isTV ) CheckForUpdates();
	}
}

//Create a tiny overlay window to keep DS alive in background
//and allow launching of activities from background.
function EnableOverlay()
{
    if( glob.overlay || !premium ) return
    glob.overlay = app.CreateOverlay();
    layHead = app.CreateLayout("Linear");
    glob.overlay.AddLayout( layHead, 0.5, 0 );
}

//Show subscription info box.
function ShowPremium()
{
	//Create dialog window and main layout.
	dlgPrem = app.CreateDialog( "DroidScript Premium" );
	if( !isChrome ) dlgPrem.SetBackColor( "#2E3134" );
	var layPremDlg = app.CreateLayout( "linear", "vertical,fillxy" );

	//Create scroller.
	var scroll = app.CreateScroller();
	scroll.SetPadding( 0.05, isChrome?0.03:0, 0.05, 0 );
	layPremDlg.AddChild( scroll );

	//Create layout inside scroller.
	var layPrem = app.CreateLayout( "linear", "vertical,fillxy" );
	scroll.AddChild( layPrem );

    var spnLevel = app.AddSpinner( layPrem, "Premium,Premium+", isChrome?0.4:0.6 );
    spnLevel.SetMargins( 0,0,0,0.02 )
    spnLevel.SetOnChange( (item)=>{
        spnLevel.premPlus = item.includes("+")
        txtPrem.SetHtml( spnLevel.premPlus ? glob.premPlusInfo : glob.premInfo )
        ShowPremiumPrice( item )
    } )

	//Create info text.
	glob.premInfo = "&bull; "+T("FreeAccessTo")
		+" <font color=#33B5E5>"+T("AllPlugins")+"</font>"
		+", "+T("IncludingAPKBuilder")+"<br><br>"
		+ "&bull; "+T("AccessTo")+" <font color=#33B5E5>"+T("AdvancedFeatures")
		+"</font> "+T("SuchAs")+"<br><br>"
		+ "&bull; "+T("AccessTo")+" <font color=#33B5E5>"+T("AdvancedSamples")+"</font><br><br>"
		+ "&bull; "+T("UseOf")+" <font color=#33B5E5>"+T("PremiumTemplates")+"</font><br><br>"
		+ "&bull; "+T("UseOf")+" <font color=#33B5E5>"+"Modern 'Material' Theme with Dark/Light mode support"+"</font><br><br>"
		+ "&bull; "+T("UseOf")+" <font color=#33B5E5>"+"NodeJS and Node Modules"+"</font> in your apps<br><br>"
		+ "&bull; <font color=#33B5E5>"+"GitHub"+"</font> integration<br><br>"
		+ "&bull; Plus <font color=#33B5E5>"+"many more"+"</font> extra features!<br>"

	glob.premPlusInfo = "&bull; All the regular <font color=#33B5E5>Premium Features</font><br><br>"
	    + "&bull; Access to your own <font color=#33B5E5>Cloud Dashboard</font><br><br>"
	    + "&bull; Publish <font color=#33B5E5>Static Websites </font>and <font color=#33B5E5>Urls</font><br><br>"
	    + "&bull; Create <font color=#33B5E5>Cloud Apps</font> and <font color=#33B5E5>REST APIs</font><br><br>"
	    + "&bull; Build a <font color=#33B5E5>Cloud Database</font> for your Apps<br><br>"
	    + "&bull; 1 GB of <font color=#33B5E5>Cloud File Storage</font><br><br>"

	var txtPrem = app.CreateText( glob.premInfo, isChrome?0.4:0.85,-1, "Left,Html,MultiLine" );
	txtPrem.SetTextSize( isChrome?10:18 );
	if( !isChrome ) txtPrem.SetTextColor( "#ffffff");
	layPrem.AddChild( txtPrem );

	//Create price text.
	txtPremPrice = app.CreateText( "", isChrome?0.4:0.8 );
	if( !isChrome ) txtPremPrice.SetTextColor( "#ffffff" );
	txtPremPrice.SetTextSize( isChrome?12:20 );
	if( isChrome ) txtPremPrice.SetMargins( 0,8,0,0, "dip" );
	if( premium ) txtPremPrice.Gone();
	layPrem.AddChild( txtPremPrice );

	if( premium ) {
		var txtIsPrem = app.CreateText( T("YouArePremium")+(premiumPlus?"+":"") );
		txtIsPrem.SetMargins( 0, 0, 0, 0.02 );
		txtIsPrem.SetTextColor("#33B5E5");
		txtIsPrem.SetTextSize( isChrome?14:20 );
		layPrem.AddChild( txtIsPrem );

		btnGoMonthly = btnGoYearly = null

        var txtUnsub = app.CreateText( "" );
        txtUnsub.SetMargins( 0, 0.01, 0, 0.05 );
        txtUnsub.SetTextSize( isChrome?11:16 );
        txtUnsub.SetTextColor("#33B5E5");
        txtUnsub.SetHtml( "<u>Unsubscribe</u>" );
        txtUnsub.SetOnTouchDown( function(){
            app.OpenUrl( "https://play.google.com/store/account/subscriptions" );
        } );
        layPrem.AddChild( txtUnsub );
	}
	else {
	    var layHoriz = app.AddLayout( layPrem, "Linear", "Horizontal" );

		btnGoMonthly = app.AddButton( layHoriz, "Monthly", 0.4,0.1 );
		btnGoMonthly.SetMargins( 0, 0.04, 0,isChrome?0.03:0.02 );
		btnGoMonthly.SetTextSize( isChrome?10:16 );
		btnGoMonthly.SetOnTouch( ()=>{btnGo_OnClick(spnLevel.premPlus?"subs_premium_plus":"subs_premium2")} );

		btnGoYearly = app.AddButton( layHoriz, "Yearly", 0.4,0.1 );
        btnGoYearly.SetMargins( 0, 0.04, 0,isChrome?0.03:0.02 );
        btnGoYearly.SetTextSize( isChrome?10:16 );
        btnGoYearly.SetOnTouch( ()=>{btnGo_OnClick(spnLevel.premPlus?"subs_premium_plus_yearly1":"subs_premium_yearly1")} );
	}

	//Add dialog layout and show dialog.
	dlgPrem.AddLayout( layPremDlg );
	dlgPrem.Show();

	//Create a playstore object.
	setTimeout( ShowPremiumPrice, 100 );
}

//Show premium price.
function ShowPremiumPrice( level )
{
	if( level && level.includes("+") )
	    playStore.GetBillingInfo( "subs_premium_plus,subs_premium_plus_yearly1", OnPremiumStoreInfo, "SUBS" );
	else
	    playStore.GetBillingInfo( "subs_premium2,subs_premium_yearly1", OnPremiumStoreInfo, "SUBS" );
}

//Show Play Store subscription price.
function OnPremiumStoreInfo( items )
{
	if( btnGoMonthly && btnGoYearly && items.length ) {
		btnGoMonthly.SetText( items[0].price + " / month" );
		btnGoYearly.SetText( items[1].price + " / year" );
	}
}

//Show the premium sign up page.
/*
function btnGoPrem_OnTouch()
{
    subsType = app.data.subs

	dlgGo = app.CreateDialog( "DroidScript " + T("Premium") );
	if( !isChrome ) dlgGo.SetBackColor( "#2E3134" );
	layGo = app.CreateLayout( "linear", "vertical,fillxy" );

	var btnGo = app.CreateButton( T("SignMeUp"), isChrome?0.2:0.4,0.1 );
	btnGo.SetMargins( 0, 0.04, 0,0.02 );
	btnGo.SetTextSize( isChrome?10:16 );
	btnGo.SetOnTouch( btnGo_OnClick );
	layGo.AddChild( btnGo );

	dlgGo.AddLayout( layGo );
	dlgGo.Show();
}
*/

//Handle the sign up.
function btnGo_OnClick( subsType )
{
	playStore.Purchase( subsType, "MyToken", OnPremPurchased, "SUBS" );
}

//Handle completed purchase.
function OnPremPurchased( prodId, orderId, purchToken, devToken, packageName )
{
	//console.log( prodId +" "+ orderId +" "+ purchToken );
	dlgPrem.Dismiss();

	//Update purchase state.
	var s = "Welcome to DroidScript Premium" + (prodId.includes("plus")?"+":"") +"\n\n" +
		"Please send an email request to support@droidscript.org if you would like to join " +
		"the premium support forum "+(prodId.includes("plus")?"and/or activate your Cloud Services":"") +
		"\n\nRestart the app and refresh your browser (if using WiFi IDE) " +
		" to access all premium features."
	app.Alert( s, "DroidScript Premium" );

	//Mark the user as a premium user.
	premium = true;
	premiumPlus = prodId.includes("plus");
}

//Get list of samples.
function GetSamples()
{
	var listArray = "";
	if( !isIO ) listArray += "Hello World:"+T("SampHelloWorld")+":x";
	//listArray += (isIO?"":"|") + "Controls Demo:"+T("SampControlsDemo")+":x";
	listArray += (isIO?"":"|") + "Controls Dark:"+T("SampControlsDemoD")+":x";
	listArray += (isIO?"":"|") + "Controls Light:"+T("SampControlsDemoL")+":x";
	if( !isIO ) listArray += "|Button Styles:"+T("SampButtonStyles")+":x";
	if( !isIO ) listArray += "|Card Layout:"+"Rounded corner layouts with shadows"+":x";
	if( !isIO ) listArray += "|Card Flip:"+"Flip a card layout"+":x";
	if( !isIO ) listArray += "|Card Animation:"+"Animated card layouts"+":x";
	if( !isIO ) listArray += "|Shopping Cart:"+"Shopping cart animations"+":x";
	if( !isIO ) listArray += "|Drawing Demo:"+T("SampDrawingDemo")+":x";
	if( !isIO ) listArray += "|Drawing Order:"+T("SampDrawingOrder")+":x";
	if( !isIO ) listArray += "|Image Rotate:"+T("SampImageRotate")+":x";
	if( !isIO ) listArray += "|Animate:"+"Animate controls and layouts"+":x";
	if( !isTV && !isIO ) listArray += "|Image Tween:"+T("SampImageTween")+":x";
	if( !isTV && !isIO ) listArray += "|Layout Slide:"+T("SampLayoutSlide")+":x";
	if( !isTV && !isIO ) listArray += "|Drawer Menu:"+T("SampDrawerMenu")+":x";
	if( !isTV && !isIO ) listArray += "|Dialog ProgressBar:"+T("SampDialogProgress")+":x";
	listArray += "|Dialog Custom:"+T("SampDialogCustom")+":x";
	listArray += "|Custom Browser Tabs:"+"Show a custom Chrome browser tab"+":x";
	if( !isIO ) listArray += "|Tabs Demo:"+T("SampTabsDemo")+":x";
	if( !isIO ) listArray += "|CheckList:"+"Shows a check list dialog"+":x";
	if( !isIO ) listArray += "|List Colors:"+"Setting list row colors"+":x";
	if( !isIO ) listArray += "|Icon Fonts:"+T("SampIconFonts")+":x";
	if( !isIO ) listArray += "|Icon Buttons:"+T("SampIconButtons")+":x";
	if( !isIO ) listArray += "|Text Formatting:"+T("SampTextFormatting")+":x";
	if( !isIO ) listArray += "|Scroller:"+T("SampScroller")+":x";
	if( !isIO ) listArray += "|Tilt And Draw:"+T("SampTiltAndDraw")+":x";
	if( !isIO ) listArray += "|Location:"+T("SampLocation")+":x";
	if( !isIO ) listArray += "|Google Maps:Google maps location search:x";
	if( !isTV&& !isIO  ) listArray += "|Notifications:"+T("SampNotify")+":x";
	listArray += "|Alarms:"+T("SampAlarms")+":x";
	if( !isTV ) listArray += "|Choose:"+T("SampChoose")+":x";
	if( !isIO ) listArray += "|Orientation:"+T("SampOrientation")+":x";
	if( !isIO ) listArray += "|Phone States:"+T("SampPhoneStates")+":x";
	listArray += "|Audio Output:"+T("SampAudioOutput")+":x";
	listArray += "|Audio Player:"+T("SampAudioPlayer")+":x";
	listArray += "|Audio Record:"+T("SampAudioRecord")+":x";
	listArray += "|Audio Sample:"+T("SampAudioSample")+":x";
	listArray += "|Audio Signal:"+T("SampAudioSignal")+":x";
	if( !isTV && !isIO ) listArray += "|Audio Synth:"+T("SampAudioSynth")+":x";
	if( !isIO ) listArray += "|Audio MIDI-Tune:"+T("SampAudioMidi")+":x";
	if( !isIO ) listArray += "|Sound Board:"+T("SampSoundBoard")+":x";
	if( !isIO ) listArray += "|Music Sequencer:"+"Interactive music sequencer"+":x";
	if( !isIO ) listArray += "|Synth Song Player:"+"Plays a synthesized tune"+":x";
	if( !isTV && !isIO ) listArray += "|Speech Recognition:"+T("SampSpeechRec")+":x";
	if( !isIO ) listArray += "|Voice Command:"+T("SampVoiceCommand")+":x";
	listArray += "|MediaStore:"+T("SampMediaStore")+":x";
	listArray += "|Video Player:"+T("SampVideoPlayer")+":x";
	listArray += "|Video Stream:"+T("SampVideoStream")+":x";
	listArray += "|YouTube Player:Play a list of YouTube videos:x";
	if( !isTV && !isIO ) listArray += "|Game Pong:"+T("SampGamePong")+":x";
	//listArray += "|Game Invaders:Simple invaders game:x";
	if( !isTV && !isIO ) listArray += "|Game Bounce:"+T("SampGameBounce")+":x";
	if( !isTV && !isIO ) listArray += "|Game BunnyStorm:"+T("SampGameBunnyStorm")+":x";
	if( !isTV && !isIO ) listArray += "|Game Horizontal Scroller:"+"Horizontal scrolling GameView sample"+":x";
	if( !isTV && !isIO ) listArray += "|Game Angry:"+"GameView Sprite Animation and Physics"+":x";
	//if( !isIO ) listArray += "|Game VScroll:"+T("SampGameVScroll")+":x";
	//if( !isIO ) listArray += "|Game HScroll:"+T("SampGameHScroll")+":x";
	if( !isIO ) listArray += "|Game Flappy:"+T("SampGameFlappy")+":x";
	listArray += "|Joystick:"+T("SampJoystick")+":x";
	//if( !isTV && !isIO ) listArray += "|GLView Simple:"+T("SampGLVSimple")+":x";
	//if( !isTV && !isIO ) listArray += "|GLView SpriteSheet:"+T("SampGLVSprite")+":x";
	//if( !isTV && !isIO ) listArray += "|GLView Advanced:"+T("SampGLVAdvanced")+":x";
	listArray += "|Text To Speech:"+T("SampTextToSpeech")+":x";
	if( !isIO ) listArray += "|Text Editor:"+T("SampTextEdit")+":x";
	if( !isTV && !isIO ) listArray += "|SMS:"+T("SampSMS")+":x";
	listArray += "|Mail Share:"+T("SampMailShare")+":x";
	listArray += "|Mail Send:"+T("SampMailSend")+":x";
	listArray += "|Mail Receive:"+T("SampMailReceive")+":x";
	listArray += "|Security Encryption:"+T("SampSecurityEncrypt")+":x";
	listArray += "|Database:"+T("SampDatabase")+":x";
	//listArray += "|CloudStore:Easy cloud storage for Apps and IOT"+":x";
	if( !isIO ) listArray += "|Calculator:"+T("SampCalculator")+":x";
	if( !isTV ) listArray += "|WebView Demo:"+T("SampWebViewDemo")+":x";
	//now a demo: if( !isTV ) listArray += "|WebView Gauges:"+T("SampWebViewGauges")+":x";
	//now a demo: if( !isTV ) listArray += "|WebView Graphs:"+T("SampWebViewGraphs")+":x";
	if( !isTV && !isIO ) listArray += "|HTML Sensors:"+T("SampHTMLSensors")+":h";
	listArray += "|HTTP Server:"+T("SampHTTPServer")+":x";
	listArray += "|HTTP Get:"+T("SampHTTPGet")+":x";
	listArray += "|Download:"+T("SampDownload")+":x";
	listArray += "|Wifi Demo:"+T("SampWifiDemo")+":x";
	listArray += "|Wifi Broadcast:"+T("SampWifiBroadcast")+":x";
	listArray += "|Wifi Access Point:"+"Control the Wifi Access point (Hotspot)"+":x";
	listArray += "|TCP Client:"+T("SampTCPClient")+":x";

	listArray += "|Camera Record:"+T("SampCameraRecord")+":x";
	listArray += "|Camera Stream PC:"+T("SampCameraStream")+":x";
	listArray += "|Camera Snap:"+T("SampCameraSnap")+":x";
	listArray += "|Camera Photo:"+T("Take photos using built-in camera app")+":x";
	listArray += "|Camera Motion:"+T("SampCameraMotion")+":x";
	listArray += "|Camera Color:"+T("SampCameraColor")+":x";
	listArray += "|Camera Faces:"+T("SampCameraFaces")+":x";
	//listArray += "|SmartWatch:Control programs with a Sony SmartWatch (PRO):x";
	//if( app.IsPro() ) listArray += "|SmartWatch Service:Write a Sony SmartWatch app (PRO):x";
	listArray += "|Shared Data:"+T("SampSharedData")+":x";
	listArray += "|Receive Intent:"+T("SampReceiveIntent")+":x";
	if( !isTV ) listArray += "|Send Intent:"+T("SampSendIntent")+":x";
	if( !isTV ) listArray += "|Send Files:"+T("SampSendFiles")+":x";
	listArray += "|App Events:"+T("SampAppEvents")+":x";

	listArray += "|USB Serial:"+T("SampUSBSerial")+":x";
	listArray += "|USB GPS:"+T("SampUSBGPS")+":x";
	listArray += "|USB Espruino:"+T("SampUSBEspruino")+":x";
	listArray += "|USB Arduino:"+T("SampUSBArduino")+":x";

	listArray += "|Bluetooth Serial:"+T("SampBluetoothSerial")+":x";
	listArray += "|Bluetooth Select:"+T("SampBluetoothSelect")+":x";
	listArray += "|Bluetooth Listen:"+T("SampBluetoothListen")+":x";
	if( !isIO ) listArray += "|Bluetooth LEDs:"+T("SampBluetoothLEDs")+":x";

	listArray += "|GPIO Banana-Pi:"+"Control the GPIO pins"+":x";
	listArray += "|UART Banana-Pi:"+"Talk serial via the UART pins"+":x";

	if( !isIO ) listArray += "|NXT Motors:"+T("SampNXTMotors")+":x";
	if( !isIO ) listArray += "|NXT Beep:"+T("SampNXTBeep")+":x";
	if( !isIO ) listArray += "|NXT Sensors:"+T("SampNXTSensors")+":x";
	if( !isIO ) listArray += "|NXT Joypad:"+T("SampNXTJoypad")+":x";
	if( !isIO ) listArray += "|NXT Direct:"+"Send raw Direct Commands to NXT"+":x";

    listArray += "|Storage Access"+(!premium?" &#9830;":"")+":"+T("SampSdcard")+":x";
	if( !isTV && !isIO ) listArray += "|Notification Listener"+(!premium?" &#9830;":"")+":"+"Listen to system notifications"+":x";
	if( !isTV && !isIO ) listArray += "|Camera Stream Transmit"+(!premium?" &#9830;":"")+":"+"Transmit camera feed to another phone via Wifi"+":x";
	if( !isTV && !isIO ) listArray += "|Camera Stream Receive"+(!premium?" &#9830;":"")+":"+"Recieve camera feed from another phone via Wifi"+":x";
	if( !isTV && !isIO ) listArray += "|In-App Purchasing"+(!premium?" &#9830;":"")+":"+T("SampInAppPurchase")+":x";
	if( !isTV && !isIO ) listArray += "|Subscription Template"+(!premium?" &#9830;":"")+":"+T("SampSubsTemplate")+":x";
	if( !isTV && !isIO ) listArray += "|Translation"+(!premium?" &#9830;":"")+":"+"Support multiple languages"+":x";
	if( !isIO ) listArray += "|Themes"+(!premium?" &#9830;":"")+":"+T("SampThemes")+":x";
	if( !isIO ) listArray += "|System Bar Colors"+(!premium?" &#9830;":"")+":"+"Set the Status and Nav bar colors"+":x";
	if( !isIO ) listArray += "|MUI Avatar List"+(!premium?" &#9830;":"")+":"+"MaterialUI Avatar list handling demo"+":x";
	if( !isIO ) listArray += "|ToolTips And Help"+(!premium?" &#9830;":"")+":"+T("SampTips")+":x";
	if( !isTV && !isIO ) listArray += "|Chat Heads"+(!premium?" &#9830;":"")+":"+T("SampChatHeads")+":x";
	if( !isIO ) listArray += "|Query Content"+(!premium?" &#9830;":"")+":"+T("SampQueryContent")+":x";
	if( !isIO ) listArray += "|Query Images"+(!premium?" &#9830;":"")+":"+"Query the device for Images"+":x";
	if( !isIO ) listArray += "|Query Videos"+(!premium?" &#9830;":"")+":"+"Query the device for Videos"+":x";
	if( !isIO ) listArray += "|Query Calendar"+(!premium?" &#9830;":"")+":"+T("SampCalendar")+":x";
	if( !isTV && !isChrome ) listArray += "|Launcher"+(!premium?" &#9830;":"")+":"+T("SampLauncher")+":x";
	listArray += "|Terminal"+(!premium?" &#9830;":"")+":"+T("SampTerminal")+":x";
	if( !isTV && !isIO ) listArray += "|Analytics"+(!premium?" &#9830;":"")+":"+T("SampAnalytics")+":x";
	if( !isIO ) listArray += "|Wizard"+(!premium?" &#9830;":"")+":"+T("SampWizard")+":x";
	listArray += "|IOT Device"+(!premium?" &#9830;":"")+":"+"Build a 'headless' IOT device"+":x";

/*
	if( experiments ) listArray += "|Hybrid - Images"+(!premium?" &#9830;":"")+":"+"Display local or remote images"+":x";
	if( experiments ) listArray += "|Hybrid - Tabs"+(!premium?" &#9830;":"")+":"+"Use tabs to group controls"+":x";
	if( experiments ) listArray += "|Hybrid - WebViews"+(!premium?" &#9830;":"")+":"+"Display external web content"+":x";
	if( experiments ) listArray += "|Hybrid - Theme"+(!premium?" &#9830;":"")+":"+"Set light or dark themes"+":x";
	if( experiments ) listArray += "|Hybrid - Drawer"+(!premium?" &#9830;":"")+":"+"Show a slide out menu drawer"+":x";
	//if( experiments ) listArray += "|Hybrid - All"+(!premium?" &#9830;":"")+":"+"Demo of all available controls"+":x";
*/

	//Save samples list for IDE.
	app.SaveText( "_Samples", listArray, "spremote" );

	//List DSJ samples (for wifi ide)
	GetDsjSamples();

	return listArray;
}

//Get list of DSJ samples.
function GetDsjSamples()
{
	var listArray = "Hello World:"+T("SampHelloWorld")+":x";
	listArray += "|Text To Speech:"+T("SampTextToSpeech")+":x";

	//Save samples list for IDE.
	app.SaveText( "_DsjSamples", listArray, "spremote" );

	return listArray;
}

//---- SDK ---------------------------------------------------------


//Show the SDK dialog.
function ShowSDKDialog()
{
	//Create dialog window.
	var dlgSdk = app.CreateDialog( "Plugin Creator" );
	if( !isChrome ) dlgSdk.SetBackColor( "#2E3134" );
	laySdk = app.CreateLayout( "linear", "vertical,fillxy" );
	laySdk.SetPadding( 0.05, 0.05, 0.05, 0 );

	//Create plugin info controls.
	PlgEdt = app.CreateTextEdit("MyPlugin", 0.75, -1, "NoSpell,MonoSpace,SingleLine");
	PlgEdt.SetHint("MyPlugin");
	laySdk.AddChild(PlgEdt);

	var packRoot = app.LoadText( "_userOrg", "com.myname", "spremote" );
	PkgEdt = app.CreateTextEdit( packRoot, 0.75, -1, "NoSpell,MonoSpace,SingleLine" );
	PkgEdt.SetHint("com.myname");
	laySdk.AddChild(PkgEdt);

	lstPlgType = app.CreateSpinner( "Basic,Control", 0.4 );
	lstPlgType.SetMargins( 0, 0.05, 0, 0 );
	laySdk.AddChild( lstPlgType );

	//Create forum link.
	var txtForum = app.CreateText( "" );
	txtForum.SetMargins( 0, 0.02, 0,0 );
	txtForum.SetTextSize( isChrome?11:16 );
	txtForum.SetTextColor("#56AEF2");
	txtForum.SetHtml( "The <u>'AIDE'</u> app is required" );
	txtForum.SetOnTouchDown( function(){app.OpenUrl( "https://play.google.com/store/apps/details?id=com.aide.ui" )} );
	laySdk.AddChild( txtForum );

	var btn2 = app.CreateButton("Create", 0.3 );
	btn2.SetOnTouch( CreateAideProject );
	btn2.SetMargins( 0, 0.05, 0, 0.02 );
	laySdk.AddChild(btn2);

	//Add dialog layout and show dialog.
	dlgSdk.AddLayout( laySdk );
	dlgSdk.Show();
}

//Create an AIDE project.
function CreateAideProject()
{
	//Check if AIDE exists.
	if( !app.IsAppInstalled("com.aide.ui") ) { app.Alert('Please install AIDE', "Error"); return; }

	//Get user entries.
	var aide = "/storage/emulated/0/AppProjects";
	var sPname =  PlgEdt.GetText();
	if (sPname === '') { return app.Alert('Missing Plugin Name!', "Name Error"); }
	if( !isValid(sPname) || sPname.indexOf(" ")>-1 ) {
		app.Alert( "Plugin name cannot contain spaces or symbols", "Name Error" ); return; }

	var sPkg =  PkgEdt.GetText();
	if (sPkg === '') { return app.Alert('Missing Package name!', "Name Error"); }
	var ret = sPkg.match( RegExp("(^|\\.)\\d","gim"), "" );
	if( ret ) { app.Alert( "Package name parts cannot start with numbers", "Name Error" ); return; }
	if( !isValid(sPkg) || sPkg.indexOf(" ")>-1 ) {
		app.Alert( "Package name cannot contain spaces or symbols", "Name Error" ); return; }

	var sPackage = sPkg.toLowerCase()+'.plugins.user';
	var fldr = aide+'/'+sPname;
	if( app.FolderExists(fldr) ) { return app.Alert(sPname+" project directory exists.  You must pick a different plugin name or delete this folder: \n\n"+fldr); }
	var srcFiles = '/assets/sdk/';
	var type = lstPlgType.GetText();
	var sAdd = (type=="Basic" ? '' : 'Ctl');

	app.ShowProgress( "Creating Plugin Project..." );
	app.MakeFolder(fldr+'/libs');
	app.MakeFolder(fldr+'/assets');
	app.MakeFolder(fldr+'/res/drawable');

	var src = fldr+'/src';
	app.MakeFolder(src);
	var aP = sPackage.split('.');
	aP.forEach(function (item) {
		src += '/'+item;
		app.MakeFolder(src);
	});

	var installer = app.ReadFile(srcFiles+'Installer.java');
	installer = replaceAll(installer,'%PACKAGENAME%', sPackage);
	installer = replaceAll(installer,'%PLUGINNAME%', sPname);
	app.WriteFile(src+'/Installer.java', installer);

	if( type=="Control" ) {
		var control = app.ReadFile(srcFiles+'MyButton.java');
		control = replaceAll(control,'%PACKAGENAME%', sPackage);
		control = replaceAll(control,'%PLUGINNAME%', sPname);
		app.WriteFile(src+'/MyButton.java', control);
	}

	var java = app.ReadFile(srcFiles+sAdd+'Plugin.java');
	java = replaceAll(java,'%PACKAGENAME%', sPackage);
	java = replaceAll(java,'%PLUGINNAME%', sPname);
	app.WriteFile(src+'/'+sPname+'.java', java);

	var inc = app.ReadFile(srcFiles+sAdd+'Plugin.inc');
	inc = replaceAll(inc,'%PACKAGENAME%', sPackage);
	inc = replaceAll(inc,'%PLUGINNAME%', sPname);
	app.WriteFile(fldr+'/assets/'+sPname+'.inc', inc);

	var html = app.ReadFile(srcFiles+sAdd+'Plugin.html');
	html = replaceAll(html,'%PACKAGENAME%', sPackage);
	html = replaceAll(html,'%PLUGINNAME%', sPname);
	app.WriteFile(fldr+'/assets/'+sPname+'.html', html);

	var droid = app.ReadFile(srcFiles+'AndroidManifest.xml');
	droid = replaceAll(droid,'%PACKAGENAME%', sPackage);
	droid = replaceAll(droid,'%PLUGINNAME%', sPname);
	app.WriteFile(fldr+'/AndroidManifest.xml', droid);

	app.CopyFile(srcFiles+'icon.png', fldr+'/res/drawable/icon.png' );
	app.HideProgress();

	//Run AIDE.
	var packageName = "com.aide.ui";
	var className = "com.aide.ui.MainActivity";
	var action = "android.intent.action.VIEW";
	var srcPath = "src/" + sPackage.replace( RegExp(".","gim"), "/" );
	var uri = src+'/'+sPname+'.java';
	app.SendIntent( packageName, className, action, null, uri );
}

function replaceAll(sString, sSearch, sReplace)
{
	return sString.split(sSearch).join(sReplace);
}


//----- Coding menus -----------------------------------------------

var lastSearch="", lastReplace="", ccTimer=null;

//Calculate size of coding menu objects etc.
function PrepareCodingMenus()
{
	//Edit these values for different Apps.
	isPortrait = ( app.GetOrientation()=="Portrait" );
	bannerHeight = app.IsPortrait()?0.08:0.12
	infoHeight = ( isPortrait ? (tablet?(aspect>0.67?0.04:0.034):0.055) : (tablet?(aspect>0.67?0.06:0.05):0.085) );
	topBarHeight = ( isPortrait ? (tablet?(aspect>0.67?0.055:0.05):0.08) : (tablet?(aspect>0.67?0.085:0.08):0.146) );
	bottomBarHeight = ( isPortrait ? (tablet?0.05:0.06) : (tablet?0.08:0.1) );
	searchBarHeight = ( isPortrait ? (tablet?(aspect>0.67?0.1:0.08):0.15) : (tablet?(aspect>0.67?0.16:0.14):0.28) );
	copyWidth =  ( isPortrait ? 0.16 : 0.09 );
	copyHeight = ( isPortrait ? 0.415 : 0.64 );
	ccHeight = 1-topBarHeight-bottomBarHeight-infoHeight;
	pxv = 1.0/app.GetDisplayHeight();
}

//Resize coding menus (eg. after device rotate).
function ResizeCodingMenus()
{
	PrepareCodingMenus();

	layCopy.SetPosition( isPortrait?0.842:0.91, isPortrait?0.12:0.15 );
	lstCopy.SetSize( copyWidth, copyHeight );
	layCC.SetPosition( isPortrait?0.7:0.77, topBarHeight );
	lstCC.SetSize( 0.3, ccHeight );
	layInfo.SetPosition( 0, 1-bottomBarHeight-infoHeight );
	layInfo.SetSize( 1, infoHeight );
	infoTxt.SetSize( 0.8, infoHeight );
	laySrchWrap.SetPosition( 0, 1-bottomBarHeight-infoHeight-searchBarHeight+pxv );
	laySrch.SetSize( 1, searchBarHeight );
	edtSrch.SetSize( 0.7 );
	edtRep.SetSize( 0.7 );
	srchBtn.SetSize( 0.1, infoHeight );
	infoBtn.SetSize( 0.1, infoHeight );

	setTimeout( function(){HandleShowKeyBoard(app.IsKeyboardShown())}, 100 );
}

//Create popup coding menus.
function CreateCodingMenus()
{
    glob.codingMenusCreated = true

	//--- Custom popup copy/cut/paste list -----

	layCopy = app.CreateLayout( "Linear", "fixxllxxxy" );
	//layCopy.SetMargins( 0.15, (tablet?0.065:0.076), 0,0 );
	layCopy.SetPosition( 0.842, 0.12 );
	layCopy.SetVisibility( "Hide" );
	layMenus.AddChild( layCopy );

	cpyLst = "[fa-hand-pointer-o],[fa-arrows-alt],[fa-copy],[fa-cut],[fa-paste],[fa-magic]";
	lstCopy = app.CreateList( cpyLst, 0.16, 0.27, "FontAwesome" );
	//lstCopy.SetPadding( 0,0.005,0,0,0 );
	lstCopy.SetSize( 0.16, copyHeight );
	lstCopy.SetBackColor( "#663366bb" );
	lstCopy.SetTextColor( "#eeeeee" );
	lstCopy.SetTextSize( 27, "pl" );
	lstCopy.SetOnTouch( lstCopy_OnTouch );
	layCopy.AddChild( lstCopy );

	//--- Custom popup code completion list -----

	layCC = app.CreateLayout( "Absolute", "Horizontal" );
	layCC.SetPosition( 0.7, topBarHeight );
	layCC.SetVisibility( "Hide" );
	layMenus.AddChild( layCC );

	arrow = "&nbsp;<font color=#888888>>></font>";
	lstCC = app.CreateList( "", 0.3, ccHeight, "Html" );
	lstCC.SetPadding(-15, 0, -15, 0, "px");
	//lstCC.SetSize( 0.3, ccHeight );
	lstCC.SetBackColor( "#bb666666" );
	lstCC.SetTextColor( "#eeeeee" );
	lstCC.SetTextSize( 12 );
	lstCC.SetOnTouch( lstCC_OnTouch );
	layCC.AddChild( lstCC );

	 //--- Custom lower info bar -----

	layInfo = app.CreateLayout( "Linear", "Horizontal,fillxy" );
	layInfo.SetPosition( 0, 1-bottomBarHeight-infoHeight );
	layInfo.SetBackColor( "#bb666666" );
	layInfo.SetVisibility( "Hide" );
	layInfo.SetPadding( 0,2,0,0,"dip" );
	layMenus.AddChild( layInfo );

	srchBtn = app.CreateText( "[fa-search]", 0.1, infoHeight, "FontAwesome" );
	srchBtn.SetSize( 0.1, infoHeight );
	srchBtn.SetTextColor( "#efefef" );
	srchBtn.SetTextSize( tablet?22:18, "dip" );
	srchBtn.SetOnTouchDown( srchBtn_OnTouchDown );
	layInfo.AddChild( srchBtn );

	infoTxt = app.CreateText( "", 0.80, infoHeight, "AutoShrink" );
	//infoTxt.SetSize( 0.90, infoHeight );
	infoTxt.SetTextColor( "#eeeeee" );
	infoTxt.SetTextSize( tablet?22:18, "dip" );
	infoTxt.SetOnTouch( infoTxt_OnTouch )
	layInfo.AddChild( infoTxt );

	infoBtn = app.CreateText( "[fa-bars]", 0.1, infoHeight, "FontAwesome" );
	infoBtn.SetSize( 0.1, infoHeight );
	infoBtn.SetTextColor( "#efefef" );
	infoBtn.SetTextSize( tablet?22:18, "dip" );
	infoBtn.SetOnTouchDown( infoBtn_OnTouchDown );
	layInfo.AddChild( infoBtn );

	//--- Search bar -----------------

	laySrchWrap = app.CreateLayout( "Linear", "touchthrough" );
	laySrchWrap.SetPosition( 0, 1-bottomBarHeight-infoHeight-searchBarHeight+pxv );
	layMenus.AddChild( laySrchWrap );
	laySrch = app.CreateLayout( "Linear", "" );
	laySrch.SetSize( 1, searchBarHeight )
	laySrch.SetBackColor( "#ff666666" );
	laySrch.SetVisibility( "Hide" );
	laySrchWrap.AddChild( laySrch );

	//Create horizontal layout.
	var layHoriz = app.CreateLayout( "linear", "horizontal" );
	laySrch.AddChild( layHoriz );

	//Create search text.
	edtSrch = app.CreateTextEdit( lastSearch, 0.7,-1,"NoSpell,SingleLine" );
	edtSrch.SetTextSize( tablet?22:18, "dip" );
	edtSrch.SetHint( "Search for" );
	edtSrch.SetOnEnter( btnSrchDwn_OnTouch );
	layHoriz.AddChild( edtSrch );

	//Create search buttons.
	btnSrchDwn = app.CreateButton( "[fa-arrow-down]", 0.1,-1,"FontAwesome,holo" );
	btnSrchDwn.SetBackColor( "#00666666" );
	btnSrchDwn.SetTextSize( tablet?22:18, "dip");
	btnSrchDwn.SetSize( 0.15 );
	btnSrchDwn.SetOnTouch( btnSrchDwn_OnTouch );
	layHoriz.AddChild( btnSrchDwn );
	btnSrchUp = app.CreateButton( "[fa-arrow-up]", 0.1,-1,"FontAwesome,holo" );
	btnSrchUp.SetBackColor( "#00666666" );
	btnSrchUp.SetTextSize( tablet?22:18, "dip" );
	btnSrchUp.SetSize( 0.15 );
	btnSrchUp.SetOnTouch( btnSrchUp_OnTouch );
	layHoriz.AddChild( btnSrchUp );

	//Create horizontal layout.
	var layHoriz = app.CreateLayout( "linear", "horizontal" );
	laySrch.AddChild( layHoriz );

	//Create replace text box.
	edtRep = app.CreateTextEdit( lastReplace, 0.7,-1,"NoSpell,SingleLine" );
	edtRep.SetHint( "Replace with" );
	edtRep.SetTextSize( tablet?22:18, "dip" );
	edtRep.SetOnEnter( btnSrchRep_OnTouch );
	layHoriz.AddChild( edtRep );

	//Create replace buttons.
	btnSrchRep = app.CreateButton( "[fa-exchange]", -1,-1,"FontAwesome,holo" );
	btnSrchRep.SetBackColor( "#00666666" );
	btnSrchRep.SetTextSize( tablet?22:18, "dip" );
	btnSrchRep.SetSize( 0.15 );
	btnSrchRep.SetOnTouch( btnSrchRep_OnTouch );
	layHoriz.AddChild( btnSrchRep );
	btnSrchRepAll = app.CreateButton( "[fa-asterisk]", -1,-1,"FontAwesome,holo" );
	btnSrchRepAll.SetBackColor( "#00666666" );
	btnSrchRepAll.SetTextSize( tablet?22:18, "dip" );
	btnSrchRepAll.SetSize( 0.15 );
	btnSrchRepAll.SetOnTouch( btnSrchRepAll_OnTouch );
	layHoriz.AddChild( btnSrchRepAll );

	//----------------------------------------

	//Add layout to app.
	app.AddLayout( layMenus );
	app.AddLayout( layFiles );

	//Use volume keys for cursor movement.
	app.DisableKeys("VOLUME_UP,VOLUME_DOWN");
	app.SetOnKey( OnVolume )

	//Create code completion object.
	cc = new CodeComp( cc_UpdateList, cc_ShowInfo );
}

function HandleShowKeyBoard( shown )
{
	//console.log( "shown " + shown );

	//Resize code completion list.
	dh = app.GetDisplayHeight();
	kbh = app.GetKeyboardHeight() / dh;
	lstCC.SetSize( 0.3, (kbh>0 ? 0.93-kbh : 0.88) );

	//Resize code window.
	//console.log( "kbh " + kbh );
	var barh = (isPortrait||!shown?bottomBarHeight:0);
	//console.log( "barh " + barh );
	edit.SetSize( 1.0, 1-kbh-topBarHeight-barh );
	layEditBtns.SetSize( 1.0, bottomBarHeight);

	//Move info bar.
	var top = 1-kbh-infoHeight-barh;
	layInfo.SetPosition( 0, top );

	//Move search bar.
	var top = 1-kbh-infoHeight-barh-searchBarHeight+pxv;
	laySrchWrap.SetPosition( 0, top );

	//Resize code completion list.
	var ccTop = layCC.GetPosition().top;
	var h = 1-kbh-topBarHeight-barh-infoHeight;
	lstCC.SetSize( 0.3, h );
}

function OnVolume( action,name,code )
{
	var ed = null;
	if( layEdit.GetVisibility()=="Show" ) ed = edit;
	//else if( layRight.GetVisibility()=="Show" ) ed = (v3?null:editSamp);

	if( ed ) {
		var pos = ed.GetCursorPos();
		if (name=="VOLUME_UP" && action=="Down") ed.SetCursorPos( pos+1 );
		else if (name=="VOLUME_DOWN" && action=="Down") ed.SetCursorPos( pos-1 );
	}
}

function cc_UpdateList( type, list, onDot )
{
	//list.unshift( arrow );
	var lst = list.join("~");
	lst = lst.replace( "Destroy~","" );
	lst = lst.replace( "~Release","" );
	lst = lst.replace( "~IsGraphical","" );
	lst = lst.replace( "~_Extract","" );
	lst = lst.replace( "~Try","" );

	if( type=="Zip" ){
		lst = lst.replace( "~CreateKey","" );
		lst = lst.replace( "~CreateDebugKey","" );
		lst = lst.replace( "~Sign","" );
		lst = lst.replace( "~UpdateManifest","" );
	}
	lstCC.SetList( lst, "~" );

	if( autoHelp && onDot && layCC.GetVisibility()=="Hide" )
		layCC.Animate( "SlideFromRight" );
}

function cc_ShowInfo( txt, docsObj )
{
	infoTxt.SetText( txt );
	
	infoTxt.data.docsUrl = "file://" + docsPath + "/" + docsObj.scope + "/" + 
		docsObj.func + ".htm#" + docsObj.subf +  "?ds=true";
}

function lstCC_OnTouch( item )
{
	try {
		if( item=="^q^" ) item = "\"";
		if( item.indexOf("&nbsp;") < 0 )
			cc.OnSelect( item );
	}
	catch( e ) {}
}

//Handle yoyo double tap.
function edit_OnDoubleTap( resizeOnly )
{
	//Set appropriate copy/cut list.
	if( layRight.GetVisibility()=="Show" ) {
		lstCopy.SetSize( copyWidth, copyHeight/2 );
		lstCopy.SetList( "[fa-hand-pointer-o],[fa-arrows-alt],[fa-copy]" );
	}
	else {
		lstCopy.SetSize( copyWidth, copyHeight );
		lstCopy.SetList( "[fa-hand-pointer-o],[fa-arrows-alt],[fa-copy],[fa-cut],[fa-paste],[fa-magic]" );
	}

	if( layCC.GetVisibility()=="Show" ) {
		layCC.Animate( "SlideToRight" );
		infoBtn.SetText("[fa-bars]");
	}
	if( !resizeOnly ) {
		if( layCopy.GetVisibility()=="Hide" ) layCopy.Animate( "SlideFromRight" );
		else layCopy.Animate( "SlideToRight" );
	}
}

//Show docs page of info text on info bar.
function infoTxt_OnTouch()
{
	if(infoTxt.data.docsUrl) webDocs.LoadUrl( infoTxt.data.docsUrl );
	if( layLeft.GetVisibility() != "Show" ) btnLeft_OnTouch();
}

//Handle code comp info icon on info bar.
function infoBtn_OnTouchDown()
{
	if( layCopy.GetVisibility()=="Show" ) layCopy.Animate( "SlideToRight" );

	if( layCC.GetVisibility()=="Show" ) {
		layCC.Animate( "SlideToRight" ); infoBtn.SetText("[fa-bars]");
	}
	else { layCC.Animate( "SlideFromRight" );  infoBtn.SetText("[fa-long-arrow-right]"); }

	if( laySrch.GetVisibility()=="Show" ) {
		laySrch.Animate( "SlideToBottom" ); srchBtn.SetText("[fa-search]");
	}
}

//Handle search icon on info bar.
function srchBtn_OnTouchDown()
{
	if( layCopy.GetVisibility()=="Show" ) layCopy.Animate( "SlideToRight" );

	if( layCC.GetVisibility()=="Show" ) {
		layCC.Animate( "SlideToRight" ); infoBtn.SetText("[fa-bars]");
	}
	if( laySrch.GetVisibility()=="Show" ) {
		laySrch.Animate( "SlideToBottom" ); srchBtn.SetText("[fa-search]");
	}
	else { laySrch.Animate( "SlideFromBottom" );  srchBtn.SetText("[fa-long-arrow-down]"); }
}

//Handle search down button.
function btnSrchDwn_OnTouch()
{
	var txt = edtSrch.GetText();
	edit.Search( txt, "Forward" );
	lastSearch = txt;
}

//Handle search up button.
function btnSrchUp_OnTouch()
{
	var txt = edtSrch.GetText();
	edit.Search( txt, "Back" );
	lastSearch = txt;
}

//Handle replace icon.
function btnSrchRep_OnTouch()
{
	var rep = edtRep.GetText();
	edit.Replace( rep );
	lastReplace = rep;
	btnSrchDwn_OnTouch();
}

//Handle replace all icon.
function btnSrchRepAll_OnTouch()
{
	var find = edtSrch.GetText();
	var rep = edtRep.GetText();
	edit.ReplaceAll( find, rep );
	lastReplace = rep;
}

//Hide all coding menus.
function HideCodingMenus( keepInfoBar )
{
	if( layCopy.GetVisibility()=="Show" ) layCopy.Animate( "SlideToRight" );

	if( layCC.GetVisibility()=="Show" ) {
		layCC.Animate( "SlideToRight" ); infoBtn.SetText("[fa-bars]");
	}
	if( !keepInfoBar ) setTimeout( function(){layInfo.SetVisibility('Hide')}, 100 );
    setTimeout( function(){laySrch.SetVisibility('Hide'); srchBtn.SetText('[fa-search]')}, 100 );
	clearTimeout( ccTimer );
}

//Handle touching on cut/copy/paste menu.
function lstCopy_OnTouch( item )
{
	//Find which edit control is active.
	var ed = edit;
	if( layRight.GetVisibility()=="Show" ) ed = editSamp;

	//Do action.
	var hide=true;
	if( item=="\\uF0C5" ) {
		ed.Copy(); ed.SetSelectMode(false); hide=false;
		//app.ShowPopup( "Text copied to clipboard" );
	}
	else if( item=="\\uF0C4" ) { ed.Cut(); ed.SetSelectMode(false); }
	else if( item=="\\uF0EA" ) { ed.Paste(); ed.SetSelectMode(false); }
	else if( item=="\\uF25A" ) {
		if( !ed.GetSelectMode() ) { ed.SetSelectMode(true); hide=false; }
		else ed.SetSelectMode(false);
	}
	else if( item=="\\uF0B2" ) {
		if( !ed.GetSelectMode() ) { ed.SelectAll(); hide=false; }
		else ed.SetSelectMode(false);
	}
	else if( item=="\\uF0D0" ) {
	    dlgMagic = app.CreateListDialog( "Modify Selection", "Beautify Classic,Beautify Compact" );
        dlgMagic.SetOnTouch( function(choice){BeautifyCode(choice)} );
        dlgMagic.Show();
	}

	//Highlight menu choice briefly.
	//lstCopy.SelectItem( item );

	//Hide menu if appropriate.
	if( hide )  {
		edit_OnDoubleTap();
	}
}

//Format the currently selected code
function BeautifyCode( style )
{
    _LoadScriptSync('/Sys/edit/beautify.js');
    var code = edit.GetSelectedText()
    
    //Set beautify options.
    var opt = { indent_size:3, indent_char:" ", space_before_conditional:false, 
        brace_style:"collapse", wrap_line_length: (tablet?100:70) }
    if( style=="Beautify Classic" ) opt.brace_style = "expand"

    //Check for user override file.
    try {
        var file = "/storage/emulated/0/DroidScript/beautify.json";
    	if( app.FileExists( file ) ) opt = JSON.parse(app.ReadFile( file ))
    }
    catch(e) { alert( "Beautify options error: "+ e ) }
	
	//Do the beautification.
    edit.Replace( js_beautify(code,opt) )
}


var lastCursorLine = 0, lastCursorPos = 0;
function CheckForCodeSuggestions()
{
    try {
    	//Hide error line if cursor moved away.
    	var curLine = edit.GetCursorLine();
    	if( lastCursorLine != curLine ) edit.HighlightLine( -1 );
    	lastCursorLine = curLine;
    
    	//Show code completion suggestions if cursor moved to new position
    	var curPos = edit.GetCursorPos();
    	if( lastCursorPos != curPos && laySrch.GetVisibility()=="Hide" && layCopy.GetVisibility()=="Hide" )
    		cc.CheckSuggest();
    	lastCursorPos = curPos;
    }
    catch( e ) { console.log( e ) }
}

//----- Code Completion -----------------------------------------------

//Code completion object.
function CodeComp( cbList, cbInfo )
{
	var d_curScope="", d_curFunc="", d_curSubf="";
	var m_curType="", m_curObj="", m_curMethod="", m_lastMethod="";
	var m_lastSuggest, m_lastFiltMethods = [];
	var m_types = {
		App:"DxApp", Layout:"Lay", Image:"Img", Button:"Btn", Toggle:"Tgl",
		CheckBox:"Chk", Spinner:"Spn", SeekBar:"Skb",
		ImageButton:"Ibn", Text:"Txt", TextEdit:"Txe", List:"Lst", WebView:"Web",
		Scroller:"Scr", Dialog:"Dlg", YesNoDialog:"Ynd", ListView:"Lvw",
		ListDialog:"Ldg", BluetoothList:"Btl", NetClient:"Net", MediaPlayer:"Aud",
		Downloader:"Dwn", MediaStore:"Med", PlayStore:"Ply", AudioRecorder:"Rec",
		Sensor:"Sns", Locator:"Loc", CameraView:"Cam", VideoView:"Vid", GLView:"GLV",
		NxtRemote:"Nxt", BluetoothSerial:"Bts", ZipUtil:"Zip", Notification:"Not",
		Crypt:"Crp", SpeechRec:"Spr", NxtInfo:"Inf", IOIO:"IOIO", SMS:"SMS",
		Email:"EMAIL", WebServer:"Wbs", USBSerial:"Usb", SysProc:"Sys", Synth:"Syn",
		Gfx:"Gfx", Sprite:"Sprite", Background:"Background", Rectangle:"Rectangle",
		Circle:"Circle", Polygon:"Polygon", Ellipse:"Ellipse", Sound:"Sound"
	};
	var m_useful = ["function","var","app","gfx","MUI","[tab]","=",",",";","(",")","{","}","\"","<",">","[","]"];
	//var types = {Layout:"Lay", Image:"Img", Text:"Txt" };

	_LoadScriptSync( "/Sys/edit/gfx.js", true );
	_LoadScriptSync( "/Sys/edit/mui.js", true );
	var objCache = {App:null, Gfx:null, _MUI:null};

	this.CheckSuggest = function()
	{
        objCache = {App:app, Gfx:gfx, _MUI:MUI};
		var filtMethods = [];
		d_curSubf = "";

		//Get all text and current cursor pos.
		var txt = edit.GetText();
		var curPos = edit.GetCursorPos();
		
		var lineStartPos = txt.lastIndexOf("\n", curPos-1);
		if(lineStartPos == -1) lineStartPos = 0;
		
		var lineEndPos = txt.indexOf("\n", curPos);
		if(lineEndPos == -1) lineEndPos = undefined;

		var line = txt.substring(lineStartPos, lineEndPos);
		var dotPos = -1;

		//Look for all relevant info in the line
		line.replace( /((\w+)\s*=\s*)?(\w+)\.(\w+)?/g, 
			function(m,o,_,f,s,p,l) {
				//Check if cursor is after match pos
				if(curPos > lineStartPos + p) {
					dotPos = p + m.indexOf(".");
					m_curObj = d_curScope = f;
					m_curMethod = d_curFunc = s;
				}
			});
		
		while(dotPos != -1) // using while to be able to break similar to goto
		{
			//Get text after dot.
			var back = line.slice(dotPos + 1, curPos - lineStartPos);
			var onDot = dotPos + 1 == curPos - lineStartPos;
			if( back.match(/\W/) || dotPos + 1 > curPos - lineStartPos ) break;

			//Find Object's type.
			//var cTypes = { app: "DsApp", gfx:"Gfx", MUI:"_MUI" };
			var cTypes = { app: "DxApp", gfx:"Gfx", MUI:"_MUI" }
			m_curType = cTypes[m_curObj] || GetObjType( m_curObj, txt );
			//console.log("res: " + d_curScope +"."+d_curFunc + (d_curSubf? "."+d_curSubf : "") + " -> " + m_curType);
			//console.log("met: " + m_curType + " " + m_curObj + "." + m_curMethod);
			
			if( m_curType )
			{
				if( m_curMethod != m_lastMethod )
				{
					ShowInfo();
					m_lastMethod = m_curMethod;
				}

				//Get method list.
				filtMethods = GetFuncs(m_curType, back);
			}
			
			break; // break from while
		}
		
		if( filtMethods.length==0 ) filtMethods = m_useful;
		if( filtMethods.toString() != m_lastFiltMethods )
		{
			if( cbList ) cbList( m_curType, filtMethods, onDot );
			m_lastFiltMethods = filtMethods.toString();
		}
	}

	this.OnSelect = function( funcName )
	{
		//var funcName = choice;
		var txt = edit.GetText();
		var curPos = edit.GetCursorPos();
		var dotPos = txt.lastIndexOf(".", curPos);

		//Check for special macros.
		if( m_useful.indexOf(funcName)>-1 )
		{
			d_curSubf = funcName;
			var funcOps = {
				'function': 'function ()\n{\n\t\n}\n',
				'{': '{', '}': '}', ';': ';', 'var': 'var ', '=': ' = ',
				'app': 'app.', 'gfx': 'gfx.', 'MUI': 'MUI.', '[tab]': '\t'
			}
			edit.InsertText( funcOps[funcName] || funcName, curPos );
			
			if(funcName == "function")
			{
				edit.SetCursorPos(curPos+9);
				app.ShowKeyboard(edit);
			}
			return;
		}

		//Check for right hand bracket on same line.
		var bracketPos = txt.indexOf( "(", dotPos+1 );
		var spacePos = txt.indexOf(" ", dotPos+1 );
		var newLinePos = txt.indexOf("\n", dotPos+1 );
		
		//Count args of current method.
		var args = -1;
		if( funcName.substr(0,1).toUpperCase() == funcName.substr(0,1) )
		{
			objCache[m_curType] = objCache[m_curType] || eval( "new "+m_curType+"()" );
			args = objCache[m_curType][funcName].length;
		}

		//Get default params.
		var dflts = F_GetDefaults( m_curType+"."+funcName, args );

		//Add func to right side of dot (replace current func if bracket found).
		if( bracketPos > -1 && (spacePos==-1 || spacePos > bracketPos) && newLinePos > bracketPos )
			edit.ReplaceText( funcName+dflts[0], dotPos+1, bracketPos+2 );
		else
			edit.ReplaceText( funcName+dflts[0], dotPos+1, curPos );

		//Move cursor past next bracket.
		//edit.SetCursorPos( dotPos + funcName.length + dflts[1] );
		var funcEnd = dotPos + funcName.length;
		edit.SetSelection( funcEnd + dflts[1], funcEnd + dflts[2] );

		//Show info for method.
		d_curFunc = funcName
		ShowInfo();
	}

	//Show method info.
	function ShowInfo()
	{
		var funcName = d_curSubf || d_curFunc;
		console.log( "funcName =" + funcName )
		if( funcName == undefined ) return
		
		if( d_curScope != "MUI" );
		{
			var params = [];
			if( funcName.substring(0,1).toUpperCase() == funcName.substring(0,1) ) {
				objCache[m_curType] = objCache[m_curType] || eval( "new "+m_curType+"()" );
				params = GetParamNames( objCache[m_curType][funcName] );
			}
			cbInfo(
				funcName+"( "+params.join(", ")+" )", 
				{scope: d_curScope, func: d_curFunc, subf: d_curSubf}
			);
		}
	}

	//Find an object's type by scanning backwards
	//for the Create statement.
	function GetObjType( obj, txt )
	{
		var createPos = txt.search( new RegExp(obj+"\\s*=\\s*(app\.|gfx\.|MUI\.)?(Create|Add)(\\w*)") );
		if( createPos == -1 ) return null;
		
		var type = RegExp.$3;
		d_curSubf = d_curFunc;
		d_curScope = RegExp.$1.substring(0, RegExp.$1.length - 1);
		d_curFunc = RegExp.$2 + type;

		return m_types[type];
	}

	//Get all methods of an object.
	function GetFuncs( objName, filter )
	{
		var obj = objCache[objName] = objCache[objName] || eval( "(new "+objName+"())" );

		//Get obj methods.
		var list = [];
		for (var k in obj)
		{
			if (k[0] != "_" &&
				obj.hasOwnProperty(k) && 
				// (typeof obj[k] === 'function') &&
				(!filter || k.toLowerCase().indexOf(filter.toLowerCase())>-1 )
			) list.push(k);
		}
		list.sort();
		return list;
	}

	//Get the names of a function's parameters.
	function GetParamNames( func )
	{
		var result = [];
		if( func ) {
			//var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
			var fnStr = func.toString();//.replace(STRIP_COMMENTS, '');
			result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g) || [];
		}
		return result;
	}

	//Get default params for various funcs.
	function F_GetDefaults( method, numArgs )
	{
		if( numArgs < 0 ) return [" ", 1,0];
		else if( numArgs==0 ) return ["()", 3,3];

		if( method=="App.Alert" ) return ["( \"\" )", 4,4];
		else if( method=="App.CreateLayout" ) return ["( \"Linear\", \"Horizontal\" )", 4,4];
		else if( method=="App.CreateText" ) return ["( \"\" )", 4,4];
		else if( method=="App.CreateButton" ) return ["( \"\" )", 4,4];
		else if( method=="App.CreateImage" ) return ["( \"Img/\", 0.5 )", 8,8];

		else if( method.indexOf(".SetTextColor") >-1 ) return ["( \"#22ff22\" )", 5,11];
		else if( method.indexOf(".SetBackColor") >-1 ) return ["( \"#cc22cc\" )", 5,11];
		else if( method.indexOf(".SetMargins") >-1 ) return ["( 0.01, 0.01, 0.01, 0.01 )", 5,5];
		else if( method.indexOf(".SetOnTouchUp") >-1 ) return ["( "+m_curObj+"_OnTouchUp )", 5,5];
		else if( method.indexOf(".SetOnTouchDown") >-1 ) return ["( "+m_curObj+"_OnTouchDown )", 5,5];
		else if( method.indexOf(".SetOnTouchMove") >-1 ) return ["( "+m_curObj+"_OnTouchMove )", 5,5];
		else if( method.indexOf(".SetOnTouch") >-1 ) return ["( "+m_curObj+"_OnTouch )", 5,5];

		else return ["(  )", 3,3];
	}
}