<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Product;

class ProductController
{
    private Product $productModel;

    public function __construct()
    {
        $this->productModel = new Product();
    }

    public function index(Request $request): Response
    {
        $filters = [
            'category_id' => $request->get('category_id'),
            'brand_id' => $request->get('brand_id'),
            'min_price' => $request->get('min_price'),
            'max_price' => $request->get('max_price'),
            'search' => $request->get('search'),
            'limit' => $request->get('limit', 20),
            'offset' => $request->get('offset', 0)
        ];
        
        $products = $this->productModel->getAll(array_filter($filters));
        
        return Response::success([
            'products' => $products,
            'count' => count($products)
        ]);
    }

    public function show(Request $request): Response
    {
        $id = (int) $request->getParam('id');
        $product = $this->productModel->findById($id);
        
        if (!$product) {
            return Response::error('Product not found', 404);
        }
        
        return Response::success(['product' => $product]);
    }

    public function store(Request $request): Response
    {
        $data = $request->getBody();
        
        // Basic validation would go here
        $required = ['name', 'price', 'category_id', 'brand_id', 'sku'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return Response::error("Field $field is required", 422);
            }
        }
        
        try {
            $productId = $this->productModel->create($data);
            $product = $this->productModel->findById($productId);
            
            return Response::success([
                'message' => 'Product created successfully',
                'product' => $product
            ], 201);
            
        } catch (\Exception $e) {
            return Response::error('Failed to create product', 500);
        }
    }

    public function update(Request $request): Response
    {
        $id = (int) $request->getParam('id');
        $data = $request->getBody();
        
        if (!$this->productModel->findById($id)) {
            return Response::error('Product not found', 404);
        }
        
        if ($this->productModel->update($id, $data)) {
            $product = $this->productModel->findById($id);
            return Response::success(['product' => $product]);
        }
        
        return Response::error('Update failed', 500);
    }

    public function destroy(Request $request): Response
    {
        $id = (int) $request->getParam('id');
        
        if (!$this->productModel->findById($id)) {
            return Response::error('Product not found', 404);
        }
        
        if ($this->productModel->delete($id)) {
            return Response::success(['message' => 'Product deleted successfully']);
        }
        
        return Response::error('Delete failed', 500);
    }
}