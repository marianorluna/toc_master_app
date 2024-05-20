import * as OBC from 'openbim-components';
import * as WEBIFC from 'web-ifc';
import { FragmentsGroup } from 'bim-fragment';
import { QtoQuery } from './src/QtoQuery';

type QtoResult = {[setName: string]: {[qtoName: string]: number}}

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
            await this.sumQuantitiesV2(fragmentIdMap);
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
    createTree() {
        const qtoList = this.uiElement.get('qtoList');
        for (const key of Object.keys(this._qtoResult)) {
            const query = new QtoQuery(this._components);
            query.title = key;
            query.domElement.style.padding = '5px 0';
            query.domElement.style.fontSize = '20px';
            qtoList.addChild(query);
            for (const queryKey of Object.keys(this._qtoResult[key])) {
                const detailElement = new OBC.SimpleUIComponent(this._components,
                `<div>${queryKey}: ${this._qtoResult[key][queryKey]}</div>`
                );
                detailElement.domElement.style.padding = '0 10px';
                detailElement.domElement.style.fontSize = '16px';
                query.slots.details.addChild(detailElement);
            }
        }
    }

    // Method for quantity takeoff
    async sumQuantities(fragmentIdMap: OBC.FragmentIdMap) {
        console.time('Quantities V1');
        const fragmentManager = await this._components.tools.get(OBC.FragmentManager);
        for (const fragmentID in fragmentIdMap) {
            // Here are the fragments
            const fragment = fragmentManager.list[fragmentID];
            console.log(fragment);
            // Here are the models with their properties
            const model = fragment.mesh.parent
            if(!(model instanceof FragmentsGroup && model.properties)) {
                continue;
            }
            // Here are the properties
            const properties = model.properties;
            // This class only has static methods
            OBC.IfcPropertiesUtils.getRelationMap(
                properties, 
                // IFC Entity Attributes is a number. Type is a Key of the Attributes Map. To obtain it we import web-ifc.
                WEBIFC.IFCRELDEFINESBYPROPERTIES,
                (setID, relatedIDs) => {
                    // Each of the meshes with calculated values
                    const set = properties[setID];
                    // Fragments with the same set ID
                    const expressIDs = fragmentIdMap[fragmentID];
                    // Working IDs
                    const workingIDs = relatedIDs.filter(id => expressIDs.has(id.toString()));
                    // console.log(properties[setID]);
                    // console.log(fragmentIdMap[fragmentID])
                    // console.log(relatedIDs.filter(id => expressIDs.has(id.toString())))
                    const { name: setName } = OBC.IfcPropertiesUtils.getEntityName(properties, setID); 
                    if (set.type !== WEBIFC.IFCELEMENTQUANTITY || workingIDs.length === 0 || !setName) { return; }
                    if (!(setName in this._qtoResult)) { this._qtoResult[setName] = {}; }
                    OBC.IfcPropertiesUtils.getQsetQuantities(
                        properties,
                        setID,
                        // Filter of fragments with name and nominal value
                        (qtoID) => {
                            // console.log(properties[qtoID])
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
        this.createTree();
    }

    // Method for quantity takeoff
    async sumQuantitiesV2(fragmentIdMap: OBC.FragmentIdMap) {
        console.time("Quantities V2")
        const fragmentManager = await this._components.tools.get(OBC.FragmentManager)
        const propertiesProcessor = await this._components.tools.get(OBC.IfcPropertiesProcessor)
        for (const fragmentID in fragmentIdMap) {
            const fragment = fragmentManager.list[fragmentID]
            const model = fragment.mesh.parent
            if (!(model instanceof FragmentsGroup && model.properties)) { continue }
            const properties = model.properties
            const modelIndexMap = propertiesProcessor.get()[model.uuid]
            if (!modelIndexMap) { continue }
            const expressIDs = fragmentIdMap[fragmentID]
            for (const expressID of expressIDs) {
            const entityMap = modelIndexMap[Number(expressID)]
            if (!entityMap) { continue }
            for (const mapID of entityMap) {
                const entity = properties[mapID]
                const { name: setName } = OBC.IfcPropertiesUtils.getEntityName(properties, mapID)
                if (!(entity.type === WEBIFC.IFCELEMENTQUANTITY && setName)) { continue }
                if (!(setName in this._qtoResult)) { this._qtoResult[setName] = {} }
                OBC.IfcPropertiesUtils.getQsetQuantities(
                    properties,
                    mapID,
                    (qtoID) => {
                    const { name: qtoName } = OBC.IfcPropertiesUtils.getEntityName(properties, qtoID)
                    const { value } = OBC.IfcPropertiesUtils.getQuantityValue(properties, qtoID)
                    if (!(qtoName && value)) { return }
                    if (!(qtoName in this._qtoResult[setName])) { this._qtoResult[setName][qtoName] = 0 }
                    this._qtoResult[setName][qtoName] += value
                }
            )}
        }}
        console.log(this._qtoResult)
        console.timeEnd("Quantities V2")
        //this.createTree();
    }

    async dispose() {
        this.resetQuantities();
        this.uiElement.dispose();
        this.enabled = false;
    }

    get(): QtoResult {
        return this._qtoResult;
    }
}


// import * as OBC from 'openbim-components';
// import * as WEBIFC from 'web-ifc';
// import { FragmentsGroup } from 'bim-fragment';


// type QtoResult = {[setName: string]: {[qtoName: string]: number}}

// export class SimpleQto extends OBC.Component<QtoResult> implements OBC.UI, OBC.Disposable {
//   static uuid = "69716dd3-3006-41fe-9fad-466af79ba8c7"
//   enabled = true
//   private _components: OBC.Components
//   private _qtoResult: QtoResult = {}
//   uiElement = new OBC.UIElement<{
//     activationBtn: OBC.Button
//     qtoList: OBC.FloatingWindow
//   }>()

//   constructor(components: OBC.Components) {
//     super(components)
//     this._components = components
//     this.setUI()
//   }

//   async setup() {
//     const highlighter = await this._components.tools.get(OBC.FragmentHighlighter)
//     highlighter.events.select.onHighlight.add(async (fragmentIdMap) => {
//       await this.sumQuantities(fragmentIdMap)
//       await this.sumQuantitiesV2(fragmentIdMap)
//     })
//     highlighter.events.select.onClear.add(() => {
//       this.resetQuantities()
//     })
//   }

//   resetQuantities() {
//     this._qtoResult = {}
//   }

//   private setUI() {
//     const activationBtn = new OBC.Button(this._components)
//     activationBtn.materialIcon = "functions"

//     const qtoList = new OBC.FloatingWindow(this._components)
//     qtoList.title = "Quantification"
//     this._components.ui.add(qtoList)
//     qtoList.visible = false

//     activationBtn.onClick.add(() => {
//       activationBtn.active = !activationBtn.active
//       qtoList.visible = activationBtn.active
//     })

//     this.uiElement.set({activationBtn, qtoList})
//   }

//   async sumQuantities(fragmentIdMap: OBC.FragmentIdMap) {
//     console.time("Quantities V1")
//     const fragmentManager = await this._components.tools.get(OBC.FragmentManager)
//     for (const fragmentID in fragmentIdMap) {
//       const fragment = fragmentManager.list[fragmentID]
//       const model = fragment.mesh.parent
//       if (!(model instanceof FragmentsGroup && model.properties)) { continue }
//       const properties = model.properties
//       OBC.IfcPropertiesUtils.getRelationMap(
//         properties,
//         WEBIFC.IFCRELDEFINESBYPROPERTIES,
//         (setID, relatedIDs) => {
//           const set = properties[setID]
//           const expressIDs = fragmentIdMap[fragmentID]
//           const workingIDs = relatedIDs.filter(id => expressIDs.has(id.toString()))
//           const { name: setName } = OBC.IfcPropertiesUtils.getEntityName(properties, setID)
//           if (set.type !== WEBIFC.IFCELEMENTQUANTITY || workingIDs.length === 0 || !setName) { return }
//           if (!(setName in this._qtoResult)) { this._qtoResult[setName] = {} }
//           OBC.IfcPropertiesUtils.getQsetQuantities(
//             properties,
//             setID,
//             (qtoID) => {
//               const { name: qtoName } = OBC.IfcPropertiesUtils.getEntityName(properties, qtoID)
//               const { value } = OBC.IfcPropertiesUtils.getQuantityValue(properties, qtoID)
//               if (!qtoName || !value) { return }
//               if (!(qtoName in this._qtoResult[setName])) { this._qtoResult[setName][qtoName] = 0 }
//               this._qtoResult[setName][qtoName] += value
//             }
//           )
//         }
//       )
//     }
//     console.log(this._qtoResult)
//     console.timeEnd("Quantities V1")
//   }

//   async sumQuantitiesV2(fragmentIdMap: OBC.FragmentIdMap) {
//     console.time("Quantities V2")
//     const fragmentManager = await this._components.tools.get(OBC.FragmentManager)
//     const propertiesProcessor = await this._components.tools.get(OBC.IfcPropertiesProcessor)
//     for (const fragmentID in fragmentIdMap) {
//       const fragment = fragmentManager.list[fragmentID]
//       const model = fragment.mesh.parent
//       if (!(model instanceof FragmentsGroup && model.properties)) { continue }
//       const properties = model.properties
//       const modelIndexMap = propertiesProcessor.get()[model.uuid]
//       if (!modelIndexMap) { continue }
//       const expressIDs = fragmentIdMap[fragmentID]
//       for (const expressID of expressIDs) {
//         const entityMap = modelIndexMap[Number(expressID)]
//         if (!entityMap) { continue }
//         for (const mapID of entityMap) {
//           const entity = properties[mapID]
//           const { name: setName } = OBC.IfcPropertiesUtils.getEntityName(properties, mapID)
//           if (!(entity.type === WEBIFC.IFCELEMENTQUANTITY && setName)) { continue }
//           if (!(setName in this._qtoResult)) { this._qtoResult[setName] = {} }
//           OBC.IfcPropertiesUtils.getQsetQuantities(
//             properties,
//             mapID,
//             (qtoID) => {
//               const { name: qtoName } = OBC.IfcPropertiesUtils.getEntityName(properties, qtoID)
//               const { value } = OBC.IfcPropertiesUtils.getQuantityValue(properties, qtoID)
//               if (!(qtoName && value)) { return }
//               if (!(qtoName in this._qtoResult[setName])) { this._qtoResult[setName][qtoName] = 0 }
//               this._qtoResult[setName][qtoName] += value
//             }
//           )
//         }
//       }
//     }
//     console.log(this._qtoResult)
//     console.timeEnd("Quantities V2")
//   }

//     async dispose() {
//         this.resetQuantities();
//         this.uiElement.dispose();
//         this.enabled = false;
//     }

//     get(): QtoResult {
//         return this._qtoResult;
//     }

// }