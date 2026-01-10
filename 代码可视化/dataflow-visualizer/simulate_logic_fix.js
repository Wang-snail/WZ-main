
// ... (previous setup) ...

// SIMULATING THE FIX in store/index.ts
// We modify how we call the function

async function testWithFix() {
    console.log('--- Starting Simulation WITH FIX ---');

    // 1. Setup Data Input Node
    const node1 = { id: 'node1', data: { moduleId: 'data_input', config: { sampleData: '{"cost": 100}' } } };

    // FIXED LOGIC: Appending invocation
    const codeWithInvoke = modules[0].code + '\nreturn execute(inputs, config, globals);';

    const executeFn1 = new Function('inputs', 'config', 'globals', codeWithInvoke);
    const result1 = executeFn1({}, node1.data.config, {});

    executionResults['node1'] = { success: true, output: result1 };
    console.log('Node 1 Output:', JSON.stringify(result1));

    // ... (rest is the same) ...
    const edge = {
        id: 'e1',
        source: 'node1',
        sourceHandle: 'output',
        target: 'node2',
        targetHandle: 'cost'
    };

    console.log('Testing connection: node1:output -> node2:cost');
    const inputs = getNodeInputs('node2', executionResults, [edge]);

    console.log('Node 2 Inputs:', inputs);

    if (inputs.cost === 100) {
        console.log('✅ SUCCESS: extracted 100 for cost');
    } else {
        console.log('❌ FAILURE: expected 100, got', inputs.cost);
    }
}

// Need to redefine getNodeInputs or re-paste it here 
// (It is available in the scope from previous write_to_file if I strictly reused the file, 
// but to be safe I will just append the new test call to the existing file content structure if I could.
// Since write_to_file overwrites by default, I must include the whole content again).

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
    }
];

let executionResults = {};

// The function we are testing (Copied from store)
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
                    // console.log(`[getNodeInputs] Smart Extraction: ...`);
                    finalValue = sourceValue[edge.targetHandle];
                }

                inputs[edge.targetHandle] = finalValue;
            }
        }
    });

    return inputs;
}

testWithFix();
