
// Mock types
const modules = [
    {
        id: 'data_input',
        inputs: [],
        outputs: [{ id: 'output' }],
        code: `
      function execute(inputs, config, globals) {
        const data = JSON.parse(config.sampleData || '{}');
        return { output: data };
      }
    `
    },
    {
        id: 'profit_calculator',
        inputs: [{ id: 'cost' }, { id: 'price' }],
        outputs: [{ id: 'profit' }],
        code: `
      function execute(inputs) {
        return { profit: (inputs.price || 0) - (inputs.cost || 0) };
      }
    `
    }
];

let executionResults = {};
let nodePortValues = {};

// The function we are testing
function getNodeInputs(nodeId, executionResults, edges) {
    const inputs = {};
    const incomingEdges = edges.filter(edge => edge.target === nodeId);

    incomingEdges.forEach(edge => {
        const sourceResult = executionResults[edge.source];
        if (sourceResult && sourceResult.success && sourceResult.output) {
            if (edge.targetHandle) {
                const sourceValue = edge.sourceHandle
                    ? sourceResult.output[edge.sourceHandle]
                    : sourceResult.output;

                // SMART EXTRACTION LOGIC
                let finalValue = sourceValue;
                if (
                    sourceValue &&
                    typeof sourceValue === 'object' &&
                    !Array.isArray(sourceValue) &&
                    edge.targetHandle in sourceValue
                ) {
                    console.log(`[getNodeInputs] Smart Extraction: ${edge.targetHandle} from`, sourceValue);
                    finalValue = sourceValue[edge.targetHandle];
                }

                inputs[edge.targetHandle] = finalValue;
            } else {
                Object.assign(inputs, sourceResult.output);
            }
        }
    });

    return inputs;
}

// Simulation
async function test() {
    console.log('--- Starting Simulation ---');

    // 1. Setup Data Input Node
    const node1 = { id: 'node1', data: { moduleId: 'data_input', config: { sampleData: '{"cost": 100}' } } };

    // Execute node1
    const executeFn1 = new Function('inputs', 'config', 'globals', modules[0].code);
    const result1 = executeFn1({}, node1.data.config, {});
    executionResults['node1'] = { success: true, output: result1 };
    console.log('Node 1 Output:', result1);

    // 2. Setup Profit Calculator Node
    const node2 = { id: 'node2', data: { moduleId: 'profit_calculator' } };

    // 3. Connect node1 -> node2
    // Scenario: Connect node1 (output) -> node2 (cost)
    const edge = {
        id: 'e1',
        source: 'node1',
        sourceHandle: 'output',
        target: 'node2',
        targetHandle: 'cost'
    };

    // 4. Test logic
    console.log('Testing connection: node1:output -> node2:cost');
    const inputs = getNodeInputs('node2', executionResults, [edge]);

    console.log('Node 2 Inputs:', inputs);

    if (inputs.cost === 100) {
        console.log('✅ SUCCESS: extracted 100 for cost');
    } else {
        console.log('❌ FAILURE: expected 100, got', inputs.cost);
    }
}

test();
