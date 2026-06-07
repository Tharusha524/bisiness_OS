<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$metric = App\Models\Metric::where('name', 'like', 'Bank Balance')->first();
if ($metric) {
    foreach (App\Models\Bank::all() as $bank) {
        $metric->metricItems()->updateOrCreate(
            ['name' => $bank->name],
            ['value' => $bank->balance]
        );
    }
    
    $controller = new App\Http\Controllers\MetricItemController();
    $reflection = new ReflectionClass(get_class($controller));
    $method = $reflection->getMethod('updateMetricTotal');
    $method->setAccessible(true);
    $method->invokeArgs($controller, [$metric]);
    
    echo "Migration completed successfully.\n";
} else {
    echo "Metric 'Bank Balance' not found.\n";
}
