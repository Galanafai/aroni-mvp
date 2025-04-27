package main

import (

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/galanafai/aroni-backend/internal/db"
	"github.com/galanafai/aroni-backend/internal/handlers"
)

func main() {
	_ = godotenv.Load()

	db.InitSupabaseClient()

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	e.POST("/api/metadata", handlers.HandleMetadata)
	e.POST("/api/scan", handlers.HandleScan)

	e.Logger.Fatal(e.Start(":8080"))
}

