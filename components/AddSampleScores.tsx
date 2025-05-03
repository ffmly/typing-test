import { addSampleScores } from '../services/firestore';

const AddSampleScores = () => {
  const handleAddSamples = async () => {
    try {
      await addSampleScores();
      alert('Sample scores added successfully!');
    } catch (error) {
      alert('Error adding sample scores. Check console for details.');
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleAddSamples}
      className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
    >
      Add Sample Scores
    </button>
  );
};

export default AddSampleScores; 