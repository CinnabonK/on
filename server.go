package main

import (
    "log"
    "net/http"

    "github.com/gorilla/websocket"
    "github.com/labstack/echo/v4"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

func handleWebSocket(c echo.Context) error {
    ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
    if err != nil {
        log.Println("Upgrade Error:", err)
        return err
    }
    defer ws.Close()

    for {
        _, message, err := ws.ReadMessage()
        if err != nil {
            log.Println("Read Error:", err)
            break
        }

        // 全クライアントにメッセージをブロードキャスト
        err = ws.WriteMessage(websocket.TextMessage, message)
        if err != nil {
            log.Println("Write Error:", err)
            break
        }
    }
    return nil
}

func main() {
    e := echo.New()

    e.Static("/", "public") // 静的ファイルの提供

    e.GET("/ws", handleWebSocket)

    e.Logger.Fatal(e.Start(":8080"))
}
