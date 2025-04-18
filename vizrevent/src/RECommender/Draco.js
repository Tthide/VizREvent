import React, { useEffect, useState } from 'react';
import Draco from 'draco-vis';

const DracoComponent = () => {
  const [solutionSet, setSolutionSet] = useState(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    // Step 1: Initialize the Draco object
    const draco = new Draco();

    // Step 2: Initialize Draco's solver
    draco.init().then(() => {
      setStatus('Draco initialized successfully.');

      // Step 3: Prepare data
      const data = [
        { name: 'Alice', age: 30, city: 'New York' },
        { name: 'Bob', age: 25, city: 'Los Angeles' },
        { name: 'Charlie', age: 35, city: 'Chicago' }
      ];
      draco.prepareData(data);

      // Step 4: Update ASP constraints
      const aspSet = {
        constraint1: ':- person(X), age(X, A), A < 25.',
        constraint2: 'person(X) :- name(X, N).'
      };
      draco.updateAsp(aspSet);

      // Step 5: Solve the program
      const program = `
        person(alice).
        person(bob).
        person(charlie).
        age(alice, 30).
        age(bob, 25).
        age(charlie, 35).
      `;
      const solutionSet = draco.solve(program, { models: 5 });

      // Step 6: Update the solution set in state
      setSolutionSet(solutionSet);
    }).catch((error) => {
      setStatus(`Error initializing Draco: ${error.message}`);
    });
  }, []);

  return (
    <div>
      <h1>Draco-Vis Example</h1>
      <p>{status}</p>
      {solutionSet && (
        <div>
          <h2>Solution Set:</h2>
          <pre>{JSON.stringify(solutionSet, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DracoComponent;
