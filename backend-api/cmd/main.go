package main

import (
	"github.com/galanafai/aroni-backend/internal/handlers"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	e.POST("/api/metadata", handlers.HandleMetadata)

	e.Logger.Fatal(e.Start(":8080"))
}