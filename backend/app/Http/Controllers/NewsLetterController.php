<?php

// namespace App\Http\Controllers;

// use Illuminate\Support\Facades\DB;
// use Carbon\Carbon;
// use App\Models\Order;
// use Illuminate\Http\Request;
// use Spatie\Newsletter\NewsletterFacade as Newsletter;

// class NewsLetterController extends Controller
// {
//     public function store(Request $request)
//     {
//         if (!Newsletter::isSubscribed($request->value)) {
//             Newsletter::subscribePending($request->value);
//             return 'Thanks for subscribing! Check your email for next steps!';
//         }
//         return 'Sorry, you have already subscribed!';
//     }
// }
