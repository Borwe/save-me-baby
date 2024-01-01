export class Presnter {
    private _enabled: boolean = false

    get enabled(): boolean { return this._enabled } 
    /** Toggle to enable or disable saving */
    toggle(){
        this._enabled = !this._enabled
    }
}

const PRESENTER: Presnter = new Presnter()
export default PRESENTER