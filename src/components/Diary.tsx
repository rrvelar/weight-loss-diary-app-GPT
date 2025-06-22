import { useEffect, useState } from "react";
import { ethers } from "ethers";

const contractAddress = "0xde65b2b24558ef18b923d31e9e6be966b9e3b0bd";
const abi = [
  "function addEntry(uint16,uint32,uint16,uint16,string) external",
  "function getMyEntries() view returns (tuple(uint256,uint16,uint32,uint16,uint16,string)[])"
];

const Diary = () => {
  const [contract, setContract] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [form, setForm] = useState({ weightKg: "", steps: "", caloriesIn: "", caloriesOut: "", note: "" });

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) return alert("Please install MetaMask.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const instance = new ethers.Contract(contractAddress, abi, signer);
      setContract(instance);
    };
    init();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tx = await contract.addEntry(
      parseInt(form.weightKg),
      parseInt(form.steps),
      parseInt(form.caloriesIn),
      parseInt(form.caloriesOut),
      form.note
    );
    await tx.wait();
    loadEntries();
  };

  const loadEntries = async () => {
    const result = await contract.getMyEntries();
    setEntries(result);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📘 Weight Loss Diary</h1>
      <form onSubmit={handleSubmit} className="grid gap-2">
        {["weightKg", "steps", "caloriesIn", "caloriesOut"].map((field) => (
          <input
            key={field}
            name={field}
            type="number"
            placeholder={field}
            className="p-2 border rounded"
            onChange={handleChange}
            value={form[field as keyof typeof form]}
            required
          />
        ))}
        <textarea
          name="note"
          placeholder="note"
          className="p-2 border rounded"
          onChange={handleChange}
          value={form.note}
          maxLength={200}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">Add Entry</button>
      </form>

      <button onClick={loadEntries} className="mt-4 underline text-blue-600">📂 Load My Entries</button>
      <div className="mt-4 space-y-2">
        {entries.map((entry: any, idx: number) => {
  const ts = entry.timestamp ? Number(entry.timestamp) : 0;
  const weight = entry.weightKg ? Number(entry.weightKg) : 0;
  const steps = entry.steps ? Number(entry.steps) : 0;
  const calIn = entry.caloriesIn ? Number(entry.caloriesIn) : 0;
  const calOut = entry.caloriesOut ? Number(entry.caloriesOut) : 0;
  const note = entry.note || "";

  return (
    <div key={idx} className="p-2 border rounded mb-2">
      📅 {ts ? new Date(ts * 1000).toLocaleString() : "?"}<br/>
      🏋️ {weight} kg | 🚶 {steps} steps<br/>
      🔥 {calIn} kcal in / {calOut} out<br/>
      📝 {note}
    </div>
  );
})}


      </div>
    </div>
  );
};

export default Diary;
