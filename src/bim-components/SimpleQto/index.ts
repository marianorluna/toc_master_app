import * as OBC from 'openbim-components';
import * as WEBIFC from 'web-ifc';
import { FragmentsGroup } from 'bim-fragment';

type QtoResult = {[setName: string]: {[qtoName: string]: number}}

// Schema for the sum object in JS
// const sum = {
//     Qto_WallBaseQuantities: {
//         volume: 20,
//         area: 30
//     }
// }

export class SimpleQto extends OBC.Component<QtoResult> implements OBC.UI, OBC.Disposable {
    static uuid = '56a0e6bf-fda2-4688-8cca-78d508c9b934';
    enabled = true;
    uiElement = new OBC.UIElement<{
        activationButton: OBC.Button;
        qtoList: OBC.FloatingWindow;
    }>();
    private _components: OBC.Components;
    private _qtoResult: QtoResult = {};

    constructor(components: OBC.Components) {
        super(components);
        this._components = components;
        components.tools.add(SimpleQto.uuid, this);
        this.setUI();
    }

    async setup() {
        const highlighter = await this._components.tools.get(OBC.FragmentHighlighter);
        highlighter.events.select.onHighlight.add(async (fragmentIdMap) => {
            await this.sumQuantities(fragmentIdMap);
            //await this.sumQuantitiesV2(fragmentIdMap);
            
        });
        highlighter.events.select.onClear.add(() => {
            this.resetQuantities();
        });
    }

    // displayResults(fragmentIdMap: OBC.FragmentIdMap) {
    //     const classifier = new OBC.FragmentClassifier(fragmentIdMap);
    // }

    resetQuantities() {
        this._qtoResult = {};
    }

    private async setUI() {
        const activationButton = new OBC.Button(this._components)
        activationButton.materialIcon = 'functions';
        
        const qtoList = new OBC.FloatingWindow(this._components);
        qtoList.title = 'Quantification';
        this._components.ui.add(qtoList);
        qtoList.visible = false;

        activationButton.onClick.add(() => {
            activationButton.active = !activationButton.active;
            qtoList.visible = !qtoList.visible;
        });
        
        this.uiElement.set({
            activationButton,
            qtoList
        });
    }

    // Challenge: Add a list of quantities to the floating window
    

    // Method for quantity takeoff
    async sumQuantities(fragmentIdMap: OBC.FragmentIdMap) {
        console.time('Quantities V1');
        const fragmentManager = await this._components.tools.get(OBC.FragmentManager);
        for (const fragmentID in fragmentIdMap) {
            const fragment = fragmentManager.list[fragmentID];
            //console.log(fragment);
            const model = fragment.mesh.parent
            if(!(model instanceof FragmentsGroup && model.properties)) {
                continue;
            }
            const properties = model.properties;
            OBC.IfcPropertiesUtils.getRelationMap(
                properties, 
                WEBIFC.IFCRELDEFINESBYPROPERTIES,
                (setID, relatedIDs) => {
                    const set = properties[setID];
                    const expressIDs = fragmentIdMap[fragmentID];
                    const workingIDs = relatedIDs.filter(id => expressIDs.has(id.toString()));
                    const { name: setName } = OBC.IfcPropertiesUtils.getEntityName(properties, setID); 
                    if (set.type !== WEBIFC.IFCELEMENTQUANTITY || workingIDs.length === 0 || !setName) { return; }
                    if (!(setName in this._qtoResult)) { this._qtoResult[setName] = {}; }
                    OBC.IfcPropertiesUtils.getQsetQuantities(
                        properties,
                        setID,
                        (qtoID) => {
                            const { name: qtoName} = OBC.IfcPropertiesUtils.getEntityName(properties, qtoID);
                            const { value } = OBC.IfcPropertiesUtils.getQuantityValue(properties, qtoID);
                            if (!qtoName || !value) { return; }
                            if (!(qtoName in this._qtoResult[setName])) { this._qtoResult[setName][qtoName] = 0; }
                            this._qtoResult[setName][qtoName] += value;
                        }
                    )
                }
            )
        }
        console.log(this._qtoResult);
        console.timeEnd('Quantities V1');
    }

    // // Method for quantity takeoff
    // async sumQuantitiesV2(fragmentIdMap: OBC.FragmentIdMap) {
    //     console.time('Quantities V2');
    //     const fragmentManager = await this._components.tools.get(OBC.FragmentManager);
    //     for (const fragmentID in fragmentIdMap) {
    //         const fragment = fragmentManager.list[fragmentID];
    //         //console.log(fragment);
    //         const model = fragment.mesh.parent
    //         if(!(model instanceof FragmentsGroup && model.properties)) {
    //             continue;
    //         }
    //         const properties = model.properties;
    //         OBC.IfcPropertiesUtils.getRelationMap(
    //             properties, 
    //             WEBIFC.IFCRELDEFINESBYPROPERTIES,
    //             (setID, relatedIDs) => {
    //                 const set = properties[setID];
    //                 const expressIDs = fragmentIdMap[fragmentID];
    //                 const workingIDs = relatedIDs.filter(id => expressIDs.has(id.toString()));
    //                 const { name: setName } = OBC.IfcPropertiesUtils.getEntityName(properties, setID); 
    //                 if (set.type !== WEBIFC.IFCELEMENTQUANTITY || workingIDs.length === 0 || !setName) { return; }
    //                 if (!(setName in this._qtoResult)) { this._qtoResult[setName] = {}; }
    //                 OBC.IfcPropertiesUtils.getQsetQuantities(
    //                     properties,
    //                     setID,
    //                     (qtoID) => {
    //                         const { name: qtoName} = OBC.IfcPropertiesUtils.getEntityName(properties, qtoID);
    //                         const { value } = OBC.IfcPropertiesUtils.getQuantityValue(properties, qtoID);
    //                         if (!qtoName || !value) { return; }
    //                         if (!(qtoName in this._qtoResult[setName])) { this._qtoResult[setName][qtoName] = 0; }
    //                         this._qtoResult[setName][qtoName] += value;
    //                     }
    //                 )
    //             }
    //         )
    //     }
    //     console.log(this._qtoResult);
    //     console.timeEnd('Quantities V2');
    // }

    async dispose() {
        this.resetQuantities();
        this.uiElement.dispose();
        this.enabled = false;
    }

    get(): QtoResult {
        return this._qtoResult;
    }
}