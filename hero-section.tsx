"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, Zap } from "lucide-react"
import { Space_Mono } from "next/font/google"

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
})

interface FormData {
  county: string
  city: string
  modelYear: string
  make: string
  model: string
  evType: string
  cafvEligibility: string
  electricUtility: string
}

interface PredictionResult {
  range: number
  efficiency: number
  chargingTime: number
  consumption: number
}

export default function HeroSection() {
  const [formData, setFormData] = useState<FormData>({
    county: "",
    city: "",
    modelYear: "",
    make: "",
    model: "",
    evType: "",
    cafvEligibility: "",
    electricUtility: "",
  })

  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDark, setIsDark] = useState(true)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.county) {
      newErrors.county = "County is required"
    }
    if (!formData.city) {
      newErrors.city = "City is required"
    }
    if (!formData.modelYear) {
      newErrors.modelYear = "Model year is required"
    }
    if (!formData.make) {
      newErrors.make = "Make is required"
    }
    if (!formData.model) {
      newErrors.model = "Model is required"
    }
    if (!formData.evType) {
      newErrors.evType = "EV type is required"
    }
    if (!formData.cafvEligibility) {
      newErrors.cafvEligibility = "CAFV eligibility is required"
    }
    if (!formData.electricUtility) {
      newErrors.electricUtility = "Electric utility is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculatePrediction = async () => {
    if (!validateForm()) return

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          county: formData.county,
          city: formData.city,
          modelYear: parseInt(formData.modelYear),
          make: formData.make,
          model: formData.model,
          evType: formData.evType,
          cafvEligibility: formData.cafvEligibility,
          electricUtility: formData.electricUtility,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to get prediction'}`)
        return
      }

      const data = await response.json()
      
      if (data.success && data.prediction) {
        setPrediction({
          range: data.prediction.electricRange,
          efficiency: Math.round(data.prediction.electricRange / 100 * 100) / 100,
          chargingTime: Math.round(data.prediction.electricRange / 50 * 60),
          consumption: Math.round((100 / data.prediction.electricRange) * 10) / 10,
        })
      }
    } catch (error) {
      console.error('Prediction error:', error)
      alert('Failed to get prediction. Make sure the Flask API is running on http://localhost:5000')
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const bgClass = isDark ? "bg-[#1a1a1a]" : "bg-white"
  const textClass = isDark ? "text-white" : "text-black"
  const cardBgClass = isDark ? "bg-[#2a2a2a]" : "bg-gray-50"
  const inputBgClass = isDark ? "bg-[#333] border-[#444]" : "bg-white border-gray-200"
  const inputTextClass = isDark ? "text-white placeholder-gray-500" : "text-black placeholder-gray-400"

  return (
    <div
      className={`min-h-screen ${bgClass} ${textClass} ${spaceMono.variable} font-mono transition-colors duration-300`}
    >
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-10"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)`
            : `linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      ></div>

      {/* Header */}
      <header
        className="relative z-50 fixed top-0 left-0 right-0 border-b backdrop-blur-sm"
        style={{ borderColor: isDark ? "#333" : "#e5e5e5" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold tracking-wider">EV PREDICT</div>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              isDark ? "bg-[#333] hover:bg-[#444]" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {isDark ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center gap-8 py-8 mb-0 text-center">
          {/* Center Section */}
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-3 tracking-wide">
              Predict Your EV
              <span className="inline-block ml-2 text-yellow-400">⚡</span>
            </h1>
            <p
              className={`text-base md:text-lg ${isDark ? "text-gray-400" : "text-gray-600"} mb-4 leading-relaxed`}
            >
              Calculate your electric vehicle's range, efficiency, and charging time with advanced analytics.
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="h-1 w-8 bg-yellow-400"></div>
              <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>Data-driven insights</span>
            </div>
          </div>
        </section>

        <section className="py-12 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Mission Content */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-12 bg-yellow-400"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">Our Mission</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Empowering EV Owners with Intelligence
              </h2>
              <p className={`text-base leading-relaxed mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                We believe in transparent, data-driven insights for electric vehicle owners. Our advanced prediction
                engine combines real-world parameters with machine learning algorithms to deliver accurate range,
                efficiency, and charging time forecasts.
              </p>
              <p className={`text-base leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Whether you're planning a long-distance trip or optimizing daily commutes, EV Predict helps you maximize
                efficiency and make informed decisions about your electric vehicle journey.
              </p>
            </div>

            {/* Mission Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className={`${cardBgClass} border-0 shadow-lg p-6 text-center`}>
                <div className="text-3xl font-bold text-yellow-400 mb-2">98%</div>
                <div className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"} uppercase tracking-wide`}>
                  Prediction Accuracy
                </div>
              </Card>
              <Card className={`${cardBgClass} border-0 shadow-lg p-6 text-center`}>
                <div className="text-3xl font-bold text-yellow-400 mb-2">50K+</div>
                <div className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"} uppercase tracking-wide`}>
                  EV Models Supported
                </div>
              </Card>
              <Card className={`${cardBgClass} border-0 shadow-lg p-6 text-center`}>
                <div className="text-3xl font-bold text-yellow-400 mb-2">2M+</div>
                <div className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"} uppercase tracking-wide`}>
                  Predictions Made
                </div>
              </Card>
              <Card className={`${cardBgClass} border-0 shadow-lg p-6 text-center`}>
                <div className="text-3xl font-bold text-yellow-400 mb-2">180+</div>
                <div className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"} uppercase tracking-wide`}>
                  Countries Reach
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-12 bg-yellow-400"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">Prediction Tool</span>
            </div>
            <h2 className="text-4xl font-bold mb-2">EV Parameters</h2>
            <p className={`text-base ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Enter your vehicle details to get accurate predictions
            </p>
          </div>

          <Card className={`${cardBgClass} border-0 shadow-lg p-8`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <TooltipProvider>
                {/* County */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-yellow-400">County</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 cursor-help opacity-50 hover:opacity-100" />
                      </TooltipTrigger>
                      <TooltipContent>Your county location</TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="text"
                    placeholder="King County"
                    value={formData.county}
                    onChange={(e) => handleInputChange("county", e.target.value)}
                    className={`${inputBgClass} ${inputTextClass} border text-sm`}
                  />
                  {errors.county && <p className="text-red-500 text-xs mt-1">{errors.county}</p>}
                </div>

                {/* City */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-yellow-400">City</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 cursor-help opacity-50 hover:opacity-100" />
                      </TooltipTrigger>
                      <TooltipContent>Your city location</TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="text"
                    placeholder="Seattle"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className={`${inputBgClass} ${inputTextClass} border text-sm`}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                {/* Model Year */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-yellow-400">Model Year</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 cursor-help opacity-50 hover:opacity-100" />
                      </TooltipTrigger>
                      <TooltipContent>Vehicle model year</TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={formData.modelYear}
                    onChange={(e) => handleInputChange("modelYear", e.target.value)}
                    className={`${inputBgClass} ${inputTextClass} border text-sm`}
                  />
                  {errors.modelYear && <p className="text-red-500 text-xs mt-1">{errors.modelYear}</p>}
                </div>

                {/* Make */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-yellow-400">Make</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 cursor-help opacity-50 hover:opacity-100" />
                      </TooltipTrigger>
                      <TooltipContent>Vehicle manufacturer</TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="text"
                    placeholder="Tesla"
                    value={formData.make}
                    onChange={(e) => handleInputChange("make", e.target.value)}
                    className={`${inputBgClass} ${inputTextClass} border text-sm`}
                  />
                  {errors.make && <p className="text-red-500 text-xs mt-1">{errors.make}</p>}
                </div>

                {/* Model */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-yellow-400">Model</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 cursor-help opacity-50 hover:opacity-100" />
                      </TooltipTrigger>
                      <TooltipContent>Vehicle model name</TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="text"
                    placeholder="Model 3"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    className={`${inputBgClass} ${inputTextClass} border text-sm`}
                  />
                  {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
                </div>

                {/* EV Type */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-yellow-400">EV Type</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 cursor-help opacity-50 hover:opacity-100" />
                      </TooltipTrigger>
                      <TooltipContent>Type of electric vehicle</TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={formData.evType} onValueChange={(value) => handleInputChange("evType", value)}>
                    <SelectTrigger className={`${inputBgClass} ${inputTextClass} border text-sm`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={cardBgClass}>
                      <SelectItem value="bev">BEV (Battery Electric)</SelectItem>
                      <SelectItem value="phev">PHEV (Plug-in Hybrid)</SelectItem>
                      <SelectItem value="fcev">FCEV (Fuel Cell)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.evType && <p className="text-red-500 text-xs mt-1">{errors.evType}</p>}
                </div>

                {/* CAFV Eligibility */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-yellow-400">CAFV Eligibility</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 cursor-help opacity-50 hover:opacity-100" />
                      </TooltipTrigger>
                      <TooltipContent>Clean Air Vehicle eligibility status</TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={formData.cafvEligibility} onValueChange={(value) => handleInputChange("cafvEligibility", value)}>
                    <SelectTrigger className={`${inputBgClass} ${inputTextClass} border text-sm`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={cardBgClass}>
                      <SelectItem value="eligible">Eligible</SelectItem>
                      <SelectItem value="not-eligible">Not Eligible</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.cafvEligibility && <p className="text-red-500 text-xs mt-1">{errors.cafvEligibility}</p>}
                </div>

                {/* Electric Utility */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-yellow-400">Electric Utility</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 cursor-help opacity-50 hover:opacity-100" />
                      </TooltipTrigger>
                      <TooltipContent>Your electric utility provider</TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="text"
                    placeholder="Seattle City Light"
                    value={formData.electricUtility}
                    onChange={(e) => handleInputChange("electricUtility", e.target.value)}
                    className={`${inputBgClass} ${inputTextClass} border text-sm`}
                  />
                  {errors.electricUtility && <p className="text-red-500 text-xs mt-1">{errors.electricUtility}</p>}
                </div>
              </TooltipProvider>
            </div>

            <Button
              onClick={calculatePrediction}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-500 active:bg-yellow-600 text-base font-bold py-5 rounded-lg transition-all shadow-md"
            >
              <Zap className="w-5 h-5 mr-2" />
              Calculate Prediction
            </Button>
          </Card>
        </section>

        {/* Results Section */}
        {prediction && (
          <section className="py-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">Prediction Results</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Range Card */}
              <Card className={`${cardBgClass} border-0 shadow-lg p-6 text-center hover:shadow-xl transition-shadow`}>
                <div
                  className={`${isDark ? "text-gray-500" : "text-gray-600"} text-xs font-semibold uppercase tracking-wide mb-3`}
                >
                  Estimated Range
                </div>
                <div className="text-4xl font-bold text-yellow-400 mb-1">{prediction.range}</div>
                <div className={isDark ? "text-gray-600" : "text-gray-500"}>kilometers</div>
              </Card>

              {/* Efficiency Card */}
              <Card className={`${cardBgClass} border-0 shadow-lg p-6 text-center hover:shadow-xl transition-shadow`}>
                <div
                  className={`${isDark ? "text-gray-500" : "text-gray-600"} text-xs font-semibold uppercase tracking-wide mb-3`}
                >
                  Adjusted Efficiency
                </div>
                <div className="text-4xl font-bold text-yellow-400 mb-1">{prediction.efficiency}</div>
                <div className={isDark ? "text-gray-600" : "text-gray-500"}>km/kWh</div>
              </Card>

              {/* Charging Time Card */}
              <Card className={`${cardBgClass} border-0 shadow-lg p-6 text-center hover:shadow-xl transition-shadow`}>
                <div
                  className={`${isDark ? "text-gray-500" : "text-gray-600"} text-xs font-semibold uppercase tracking-wide mb-3`}
                >
                  Charging Time
                </div>
                <div className="text-4xl font-bold text-yellow-400 mb-1">{prediction.chargingTime}</div>
                <div className={isDark ? "text-gray-600" : "text-gray-500"}>minutes</div>
              </Card>

              {/* Consumption Card */}
              <Card className={`${cardBgClass} border-0 shadow-lg p-6 text-center hover:shadow-xl transition-shadow`}>
                <div
                  className={`${isDark ? "text-gray-500" : "text-gray-600"} text-xs font-semibold uppercase tracking-wide mb-3`}
                >
                  Energy Consumption
                </div>
                <div className="text-4xl font-bold text-yellow-400 mb-1">{prediction.consumption}</div>
                <div className={isDark ? "text-gray-600" : "text-gray-500"}>kWh per 100km</div>
              </Card>
            </div>
          </section>
        )}

        {/* Footer Spacer */}
        <div className="py-6"></div>
      </main>
    </div>
  )
}
