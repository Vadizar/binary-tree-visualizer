Binary Tree Editor & Visualizer built with Vue 3, Pinia, and TailwindCSS.

**Install:**

* npm i
* npm run dev
* tested on Node **v24.0.1**

**Core Components:**

- `TreeVisualizer.vue` – Main container and orchestration logic
- `TreeNode.vue` – Individual node rendering and interaction
- `ControlPanel.vue` – Left sidebar with all controls and information

**Dialog Components:**

- `dialogs/CreateRoot.vue` – Root node creation
- dialogs/`AddChild.vue `– Child node addition
- dialogs/`EditNode.vue `– Node value editing
- `dialogs/ColorPicker.vue` – Color selection interface
- `dialogs/Annotation.vue` – Annotation management
- `dialogs/ImportExport.vue` – Data import/export functionality

**Information Components:**

- `TreeStats.vue` – Real-time tree statistics
- `NodeInfoPanel.vue` – Selected node information display
- `HotkeysHelp.vue` – Keyboard shortcuts reference

**State Management:**

- `stores/treeStore.js` – Centralized Pinia store with undo/redo system
