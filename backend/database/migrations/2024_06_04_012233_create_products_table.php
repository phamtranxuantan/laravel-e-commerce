<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->unsigned()->index();
            $table->integer('category_id')->unsigned()->index();
            $table->integer('deal_id')->unsigned()->nullable()->index();
            $table->string('photo');
            $table->string('brand');
            $table->string('name');
            $table->string('description');
            $table->string('details');
            $table->double('price');
            $table->integer('discount')->nullable();
            $table->double('price_before')->nullable();
            $table->timestamps();
        });

        if (config('app.debug') == true) {
            DB::table('products')->insert([
                [
                    'user_id' => 1,
                    'category_id' => 1,
                    'deal_id' => null,
                    'photo' => '[
                        "product01.png",
                        "product03.png",
                        "product06.png",
                        "product08.png"
                    ]',
                    'brand' => 'HP',
                    'name' => 'HP Probook 4540s',
                    'description' => 'This is the product description!',
                    'details' => 'These are the product details',
                    'price' => 700,
                    'discount' =>20,
                    'price_before' => 700,
                    'created_at' => now()
                ],
            ]);

            DB::table('products')->insert([
                [
                    'user_id' => 1,
                    'category_id' => 1,
                    'deal_id' => null,
                    'photo' =>  '[
                        "product01.png",
                        "product03.png",
                        "product06.png",
                        "product08.png"
                    ]',
                    'brand' => 'Dell',
                    'name' => 'Dell XPS',
                    'description' => 'This is the product description!',
                    'details' => 'These are the product details',
                    'price' => 1700,
                    'created_at' => now()
                ],
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
