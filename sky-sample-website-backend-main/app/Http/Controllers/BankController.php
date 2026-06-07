<?php

namespace App\Http\Controllers;

use App\Models\Bank;
use App\Models\System;
use App\Models\Metric;
use Illuminate\Http\Request;

class BankController extends Controller
{
    /**
     * Display a listing of the banks.
     */
    public function index()
    {
        return response()->json(Bank::orderBy('id', 'asc')->get());
    }

    /**
     * Store a newly created bank in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'balance' => 'required|numeric|min:0',
        ]);

        $bank = Bank::create($validated);

        $this->updateTotalBankBalance();

        return response()->json($bank, 201);
    }

    /**
     * Update the specified bank in storage.
     */
    public function update(Request $request, $id)
    {
        $bank = Bank::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'balance' => 'required|numeric|min:0',
        ]);

        $bank->update($validated);

        $this->updateTotalBankBalance();

        return response()->json($bank);
    }

    /**
     * Remove the specified bank from storage.
     */
    public function destroy($id)
    {
        $bank = Bank::findOrFail($id);
        $bank->delete();

        $this->updateTotalBankBalance();

        return response()->json([
            'message' => 'Bank deleted successfully.'
        ]);
    }

    /**
     * Calculate sum of all banks and update the 'Bank Balance' metric in the Finance system.
     */
    protected function updateTotalBankBalance()
    {
        $sum = Bank::sum('balance');
        $formattedSum = 'Rs. ' . number_format($sum);

        // Find the Finance system and its Bank Balance metric
        $financeSystem = System::where('name', 'like', 'Finance')->first();
        if ($financeSystem) {
            $metric = $financeSystem->metrics()->where('name', 'like', 'Bank Balance')->first();
            if ($metric) {
                $bankNames = Bank::pluck('name')->toArray();
                $metric->update([
                    'value' => $formattedSum,
                    'items' => $bankNames
                ]);
            }
        }
    }
}
