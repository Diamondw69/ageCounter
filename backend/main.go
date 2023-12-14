package backend

import "net/http"

func main() {

	http.HandleFunc("/birthday", handleBirthday)
	http.ListenAndServe(":8080", nil)
}

func handleBirthday(w http.ResponseWriter, r *http.Request) {

}
