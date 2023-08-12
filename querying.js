import { QueryEngine } from '@comunica/query-sparql';

const queryEngine = new QueryEngine();

// TEMP: needs to be changed to query building app function
function buildQuery(subjectResource) {
	return `
SELECT ?p ?o
WHERE {
    <${subjectResource}> ?p ?o.
}
`;
}

export async function fetchPredicatesAndObjects(subjectResource) {
	let predicatesAndObjects;

	// TEMP: use local storage to not overload Stad Gent server
	const saved = localStorage.getItem('temp_query_results');
	if (saved) {
		console.log('Use local storage!');
		predicatesAndObjects = JSON.parse(saved);
	} else {
		console.log('No local storage!');

		const query = buildQuery(subjectResource);
		const bindingsStream = await queryEngine.queryBindings(query, {
			sources: ['https://stad.gent/sparql'],
		});
		const bindings = await bindingsStream.toArray();
		predicatesAndObjects = bindings.map((binding) => {
			const predicate = binding.get('p').value;
			const object = binding.get('o').value;
			return { predicate: predicate, object: object };
		});

		localStorage.setItem(
			'temp_query_results',
			JSON.stringify(predicatesAndObjects)
		);
	}

	return predicatesAndObjects;
}