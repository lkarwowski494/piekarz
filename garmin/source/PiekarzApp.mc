import Toybox.Application;
import Toybox.Lang;
import Toybox.WatchUi;

class PiekarzApp extends Application.AppBase {

    function initialize() {
        AppBase.initialize();
    }

    function onStart(state as Dictionary?) as Void {
    }

    function onStop(state as Dictionary?) as Void {
    }

    function getInitialView() as [Views] or [Views, InputDelegates] {
        var view = new PiekarzView();
        var delegate = new PiekarzDelegate(view);
        return [view, delegate];
    }
}
