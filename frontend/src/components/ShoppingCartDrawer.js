// src/components/ShoppingCartDrawer.js
import React, { useEffect, useState, Fragment } from 'react'
import axios from 'axios'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function ShoppingCartDrawer({ username, open, setOpen }) {
  const [cart, setCart] = useState([])
  const API_BASE_URL = "/api";


  // 每次抽屉打开时，加载购物车
  useEffect(() => {
    if (open) {
      loadCart()
    }
  }, [open])

  const loadCart = () => {
    axios.get(`${API_BASE_URL}/cart`, { params: { username } })
      .then(res => setCart(res.data))
      .catch(err => console.error("Failed to load cart:", err))
  }

  // 删除购物车项
  const handleDelete = (cartItemId) => {
    axios.delete(`${API_BASE_URL}/cart/${cartItemId}`, {
      data: { username }
    })
      .then(() => loadCart())
      .catch(err => alert(err.response?.data?.detail || "Failed to delete item"))
  }

  // 结算
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty.")
      return
    }
    const items = cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }))
    axios.post(`${API_BASE_URL}/orders`, { username, items })
      .then(() => {
        alert("Order placed successfully!")
        // 下单成功后，可刷新购物车
        loadCart()
      })
      .catch(err => alert(err.response?.data?.detail || "Failed to place order"))
  }

  // 计算总价
  const subtotal = cart.reduce((sum, item) => {
    const price = item.product?.price || 0
    return sum + price * item.quantity
  }, 0)

  // 更新购物车数量
  const handleUpdateQuantity = (cartItemId, newQuantity) => {
    // newQuantity 小于 1 则不允许
    if (newQuantity < 1) return

    axios.put(`${API_BASE_URL}/cart/${cartItemId}`, {
      username,
      new_quantity: newQuantity
    })
      .then(res => {
        // 直接更新当前 cart 中对应项的数量
        const updatedCart = cart.map(item => {
          if (item.id === cartItemId) {
            return { ...item, quantity: newQuantity }
          }
          return item
        })
        setCart(updatedCart)
      })
      .catch(err => alert(err.response?.data?.detail || "Failed to update quantity"))
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Shopping Cart
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {/* Cart Items */}
                      <div className="mt-8">
                        {cart.length === 0 ? (
                          <p className="text-center text-gray-500">Your cart is empty.</p>
                        ) : (
                          <ul className="-my-6 divide-y divide-gray-200">
                            {cart.map((item) => (
                              <li key={item.id} className="flex py-6">
                                {/* Product image */}
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  {item.product?.imageUrl && (
                                    <img
                                      src={`http://13.113.236.36:8000/${item.product.imageUrl}`}
                                      alt={item.product?.name}
                                      className="h-full w-full object-cover object-center"
                                    />
                                  )}
                                </div>

                                {/* Info & quantity */}
                                <div className="ml-4 flex flex-1 flex-col">
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>{item.product?.name}</h3>
                                    <p className="ml-4">¥{item.product?.price}</p>
                                  </div>
                                  <div className="mt-1 text-sm text-gray-500">
                                    {item.product?.category}
                                  </div>

                                  {/* 修改数量 */}
                                  <div className="mt-2 flex items-center space-x-2">
                                    <label className="text-xs text-gray-500">Qty:</label>
                                    <input
                                      type="number"
                                      min={1}
                                      value={item.quantity}
                                      onChange={(e) =>
                                        handleUpdateQuantity(item.id, parseInt(e.target.value, 10))
                                      }
                                      className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                                    />
                                  </div>

                                  {/* Remove */}
                                  <div className="flex mt-2 justify-between text-sm">
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(item.id)}
                                      className="text-red-600 hover:text-red-800 text-xs"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Footer: subtotal & checkout */}
                    {cart.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>Subtotal</p>
                          <p>¥{subtotal.toFixed(2)}</p>
                        </div>
                        <div className="mt-6">
                          <button
                            onClick={handleCheckout}
                            className="w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                          >
                            Checkout
                          </button>
                        </div>
                        <div className="mt-6 flex justify-center text-sm text-gray-500">
                          <p>
                            or{' '}
                            <button
                              type="button"
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                              onClick={() => setOpen(false)}
                            >
                              Continue Shopping<span aria-hidden="true"> &rarr;</span>
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
