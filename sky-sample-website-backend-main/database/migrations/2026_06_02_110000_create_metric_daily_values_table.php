<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metric_daily_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('metric_id')->constrained()->onDelete('cascade');
            $table->date('data_date');
            $table->string('value')->nullable();
            $table->json('item_values')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['metric_id', 'data_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metric_daily_values');
    }
};
