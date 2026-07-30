#!/bin/bash
#
# Start script cho Love Memories.
#
# Mục tiêu: chỉ cần chạy `./start.sh` là xong. Script tự làm mọi bước chuẩn bị
# (cài dependency, sinh Prisma Client, đồng bộ schema lên database, build khi
# chạy production) rồi mới khởi động server.
#
# Mọi câu hỏi đều có giá trị mặc định — bấm Enter ba lần là chạy chế độ
# Development / Foreground / log thường. Dùng `./start.sh --auto` để bỏ qua hẳn
# phần hỏi đáp (hữu ích cho CI hoặc khi không có terminal tương tác).
#
# Tương thích bash 3.2 (bản mặc định của macOS): không dùng mảng kết hợp,
# không dùng `sed -i` kiểu GNU.

# Không dùng `set -e`: nhiều bước dưới đây được kiểm tra mã lỗi một cách chủ ý.
set -uo pipefail

# ---------------------------------------------------------------- in thông báo

print_status()  { printf "\033[1;34m==>\033[0m \033[1m%s\033[0m\n" "$1"; }
print_success() { printf "\033[1;32m==>\033[0m \033[1;32m%s\033[0m\n" "$1"; }
print_warning() { printf "\033[1;33m==>\033[0m \033[1;33mCẢNH BÁO: %s\033[0m\n" "$1"; }
print_error()   { printf "\033[1;31m==>\033[0m \033[1;31mLỖI: %s\033[0m\n" "$1"; }
print_step()    { printf "\n\033[1;36m── %s\033[0m\n" "$1"; }

AUTO_MODE=false
SKIP_CHECKS=false
for arg in "$@"; do
    case "$arg" in
        --auto|-y)     AUTO_MODE=true ;;
        --skip-checks) SKIP_CHECKS=true ;;
        --help|-h)
            cat <<'USAGE'
Cách dùng: ./start.sh [tuỳ chọn]

  --auto, -y      Không hỏi gì, dùng mặc định (Development / Foreground / log thường)
  --skip-checks   Bỏ qua bước kiểm tra chuẩn bị (dependency, Prisma, schema, build)
  --help, -h      Hiện trợ giúp này

Không tuỳ chọn: hỏi 3 câu, mỗi câu đã có mặc định — bấm Enter là được.
USAGE
            exit 0
            ;;
    esac
done

# Không có terminal tương tác (chạy qua CI, cron…) thì tự chuyển sang --auto,
# nếu không `read` sẽ nhận chuỗi rỗng và script đi vào nhánh sai.
if [ ! -t 0 ]; then
    AUTO_MODE=true
fi

cd "$(dirname "$0")" || exit 1

# ------------------------------------------------------------- chọn profile

if [ "$AUTO_MODE" = true ]; then
    profile_choice=1
else
    echo "Chọn môi trường:"
    echo "  1) Development  (.env.development)   [mặc định]"
    echo "  2) Production   (.env.production)"
    printf "Nhập lựa chọn [1-2]: "
    read -r profile_choice
    profile_choice="${profile_choice:-1}"
fi

case "$profile_choice" in
    1)
        ACTIVE_ENV=".env.development"
        RUN_DEV=true
        PM2_NAME="love-memories-dev"
        LOG_FILE="dev-server.log"
        ;;
    2)
        ACTIVE_ENV=".env.production"
        RUN_DEV=false
        PM2_NAME="love-memories"
        LOG_FILE="prod-server.log"
        ;;
    *)
        print_error "Lựa chọn không hợp lệ: '$profile_choice'"
        exit 1
        ;;
esac

if [ ! -f "$ACTIVE_ENV" ]; then
    print_error "Không tìm thấy $ACTIVE_ENV."
    echo "Chạy './setup.sh' để khởi tạo các profile trước."
    exit 1
fi

# ------------------------------------------------- ghép .env (an toàn, đa nền)
#
# Profile được chọn là nguồn cấu hình chính. Chỉ khi một giá trị trong profile
# còn trống/placeholder mới dùng giá trị thật tương ứng từ .env hiện tại làm
# fallback. Nhờ vậy, sửa .env.development hoặc .env.production luôn có hiệu lực
# ngay lần chạy kế tiếp, nhưng key thật vẫn không bị mất nếu profile mới tạo còn
# chứa giá trị mẫu.
#
# Bản cũ từng dùng `sed -i "..."` kiểu GNU, không tương thích BSD sed trên
# macOS. Việc ghép bên dưới dùng bash thuần và tương thích bash 3.2.

is_placeholder() {
    printf '%s' "$1" | grep -qE 'placeholder|-key-here|project-id|YOUR-|prod-project|\[[A-Z_-]+\]'
}

merge_env() {
    profile_file="$1"; current_file="$2"; out_file="$3"
    : > "$out_file"
    while IFS= read -r line || [ -n "$line" ]; do
        case "$line" in
            \#*|"") printf '%s\n' "$line" >> "$out_file"; continue ;;
        esac
        key="${line%%=*}"
        if [ "$key" = "$line" ]; then
            printf '%s\n' "$line" >> "$out_file"; continue
        fi

        profile_value="${line#*=}"
        profile_bare=$(printf '%s' "$profile_value" | sed -e 's/^"//' -e 's/"$//')

        # Giá trị thật trong profile luôn thắng. .env chỉ là fallback khi dòng
        # tương ứng của profile chưa được cấu hình.
        if [ -n "$profile_bare" ] && ! is_placeholder "$profile_bare"; then
            printf '%s\n' "$line" >> "$out_file"
            continue
        fi

        fallback=""
        if [ -f "$current_file" ]; then
            fallback=$(grep -E "^${key}=" "$current_file" 2>/dev/null | tail -1 | cut -d= -f2-)
        fi
        fallback_bare=$(printf '%s' "$fallback" | sed -e 's/^"//' -e 's/"$//')

        if [ -n "$fallback_bare" ] && ! is_placeholder "$fallback_bare"; then
            printf '%s=%s\n' "$key" "$fallback" >> "$out_file"
        else
            printf '%s\n' "$line" >> "$out_file"
        fi
    done < "$profile_file"
}

print_step "Chuẩn bị cấu hình"
print_status "Đặt profile hoạt động: $ACTIVE_ENV"
# Next.js ưu tiên .env.local hơn .env. Dùng nó làm fallback nếu có, sau đó
# đồng bộ cả hai file để Prisma và Next.js chắc chắn dùng cùng một profile.
FALLBACK_ENV=".env"
if [ -f ".env.local" ]; then
    FALLBACK_ENV=".env.local"
fi
merge_env "$ACTIVE_ENV" "$FALLBACK_ENV" ".env.tmp"
mv .env.tmp .env
cp .env .env.local

# Biến đã `export` trong terminal có độ ưu tiên cao hơn dotenv của Prisma/Next.
# Nạp profile vào chính tiến trình này để URL cũ trong shell không thể ghi đè
# các file vừa tạo. Parse từng dòng thay vì `source .env`, tránh thực thi nội
# dung shell ngoài ý muốn.
load_env_exports() {
    while IFS= read -r line || [ -n "$line" ]; do
        case "$line" in \#*|"") continue ;; esac
        key="${line%%=*}"
        value="${line#*=}"
        if ! printf '%s' "$key" | grep -qE '^[A-Za-z_][A-Za-z0-9_]*$'; then
            continue
        fi
        case "$value" in
            \"*\") value="${value#\"}"; value="${value%\"}" ;;
            \'*\') value="${value#\'}"; value="${value%\'}" ;;
        esac
        export "$key=$value"
    done < .env
}
load_env_exports
print_success "Đã đặt và nạp .env/.env.local ($ACTIVE_ENV được ưu tiên; cấu hình cũ chỉ fallback cho placeholder)."

# Kiểm tra sau khi ghép — nếu vẫn còn placeholder thì DB/Supabase sẽ không chạy.
if grep -qE '^(DATABASE_URL|DIRECT_URL|NEXT_PUBLIC_SUPABASE_URL)=' .env; then
    for key in DATABASE_URL DIRECT_URL NEXT_PUBLIC_SUPABASE_URL; do
        val=$(grep -E "^${key}=" .env | tail -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//')
        if [ -z "$val" ] || is_placeholder "$val"; then
            print_error "$key trong .env vẫn là giá trị mẫu."
            echo "Hãy điền thông tin thật vào $ACTIVE_ENV rồi chạy lại."
            exit 1
        fi
    done
else
    print_error "Thiếu DATABASE_URL / DIRECT_URL / NEXT_PUBLIC_SUPABASE_URL trong .env."
    exit 1
fi

# ----------------------------------------------- PostgreSQL local qua Docker

read_env_value() {
    grep -E "^${1}=" .env 2>/dev/null | tail -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'
}

ensure_local_postgres() {
    local_enabled=$(read_env_value LOCAL_POSTGRES_DOCKER)
    case "$local_enabled" in
        true|TRUE|1|yes|YES) ;;
        *) return 0 ;;
    esac

    container=$(read_env_value LOCAL_POSTGRES_CONTAINER)
    image=$(read_env_value LOCAL_POSTGRES_IMAGE)
    port=$(read_env_value LOCAL_POSTGRES_PORT)
    db_user=$(read_env_value LOCAL_POSTGRES_USER)
    db_password=$(read_env_value LOCAL_POSTGRES_PASSWORD)
    db_name=$(read_env_value LOCAL_POSTGRES_DB)
    db_url=$(read_env_value DATABASE_URL)

    container="${container:-love-memories-postgres}"
    image="${image:-postgres:16.14-alpine}"
    port="${port:-55432}"
    db_user="${db_user:-love_memories}"
    db_password="${db_password:-love_memories_dev}"
    db_name="${db_name:-love_memories}"

    case "$db_url" in
        *"@127.0.0.1:${port}/"*|*"@localhost:${port}/"*) ;;
        *)
            print_warning "LOCAL_POSTGRES_DOCKER đang bật nhưng DATABASE_URL không trỏ tới localhost:$port; bỏ qua Docker local."
            return 0
            ;;
    esac

    print_step "Chuẩn bị PostgreSQL local"
    if ! command -v docker >/dev/null 2>&1; then
        print_error "Development đang dùng database local nhưng máy chưa có Docker."
        echo "Cài Docker Desktop hoặc Colima rồi chạy lại ./start.sh."
        return 1
    fi
    if ! docker info >/dev/null 2>&1; then
        if command -v colima >/dev/null 2>&1; then
            print_status "Docker chưa chạy — đang khởi động Colima..."
            if ! colima start; then
                print_error "Không khởi động được Colima."
                return 1
            fi
        else
            print_error "Docker chưa chạy. Hãy mở Docker Desktop rồi chạy lại ./start.sh."
            return 1
        fi
    fi

    if docker inspect "$container" >/dev/null 2>&1; then
        if [ "$(docker inspect -f '{{.State.Running}}' "$container" 2>/dev/null)" != "true" ]; then
            print_status "Đang khởi động container $container..."
            if ! docker start "$container" >/dev/null; then
                print_error "Không khởi động được container $container."
                return 1
            fi
        else
            print_success "Container $container đang chạy."
        fi
    else
        print_status "Đang tạo PostgreSQL local riêng tại 127.0.0.1:$port..."
        if ! docker run -d \
            --name "$container" \
            --restart unless-stopped \
            -e POSTGRES_USER="$db_user" \
            -e POSTGRES_PASSWORD="$db_password" \
            -e POSTGRES_DB="$db_name" \
            -p "127.0.0.1:${port}:5432" \
            -v "love-memories-postgres-data:/var/lib/postgresql/data" \
            "$image" >/dev/null; then
            print_error "Không tạo được container PostgreSQL local."
            return 1
        fi
    fi

    wait_count=0
    while [ "$wait_count" -lt 45 ]; do
        if docker exec "$container" pg_isready -U "$db_user" -d "$db_name" >/dev/null 2>&1; then
            print_success "PostgreSQL local đã sẵn sàng tại 127.0.0.1:$port."
            return 0
        fi
        sleep 1
        wait_count=$((wait_count + 1))
    done

    print_error "PostgreSQL local không sẵn sàng sau 45 giây."
    docker logs --tail 20 "$container" 2>&1 | sed 's/^/    /'
    return 1
}

# ------------------------------------------------------------ bước chuẩn bị

if [ "$SKIP_CHECKS" = false ]; then
    if ! ensure_local_postgres; then
        exit 1
    fi

    print_step "Kiểm tra dependency"

    if ! command -v node > /dev/null 2>&1; then
        print_error "Chưa có Node.js. Cần Node 18 trở lên: https://nodejs.org/"
        exit 1
    fi
    node_major=$(node -v | sed -E 's/^v([0-9]+).*/\1/')
    if [ "$node_major" -lt 18 ]; then
        print_error "Node.js $(node -v) quá cũ. Next.js 14 cần Node 18+."
        exit 1
    fi
    print_success "Node $(node -v), npm $(npm -v)"

    if [ ! -d node_modules ]; then
        print_status "Chưa có node_modules — đang chạy npm install..."
        if ! npm install; then
            print_error "npm install thất bại."
            exit 1
        fi
    fi
    print_success "Dependency đã sẵn sàng."

    # ---- Prisma Client -----------------------------------------------------
    print_step "Sinh Prisma Client"
    if npx prisma generate > /tmp/lm-prisma-generate.log 2>&1; then
        print_success "Đã sinh Prisma Client."
    else
        print_error "prisma generate thất bại. Xem /tmp/lm-prisma-generate.log"
        tail -15 /tmp/lm-prisma-generate.log
        exit 1
    fi

    # ---- Đồng bộ schema lên database --------------------------------------
    #
    # `migrate diff` so schema.prisma với database thật:
    #   0 = khớp, 2 = có sai lệch, khác = lỗi (thường là không kết nối được).
    print_step "Đối chiếu schema với database"
    diff_out=$(npx prisma migrate diff \
        --from-schema-datasource prisma/schema.prisma \
        --to-schema-datamodel prisma/schema.prisma \
        --exit-code 2>&1)
    diff_rc=$?

    case "$diff_rc" in
        0)
            print_success "Schema đã khớp với database."
            ;;
        2)
            print_warning "Database đang thiếu thay đổi so với schema.prisma."
            echo "$diff_out" | grep -E '^\[?[+-]|^ *\[' | head -20
            print_status "Đang áp schema (prisma db push)..."
            if npx prisma db push --skip-generate; then
                print_success "Đã áp schema lên database."
            else
                print_error "Áp schema thất bại. Server có thể lỗi khi truy vấn các cột mới."
                exit 1
            fi
            ;;
        *)
            print_error "Không kết nối được database."
            echo ""
            # In nguyên văn báo lỗi của Prisma: mã P1001 một mình không đủ để
            # phân biệt "project đã xoá" với "sai mật khẩu" hay "mất mạng".
            printf '%s\n' "$diff_out" \
                | grep -vE '^\s*$|deprecated|prisma-config|Environment variables loaded|Prisma schema loaded' \
                | tail -8 | sed 's/^/    /'
            echo ""
            echo "File nguồn đã chọn: $ACTIVE_ENV"
            echo "Prisma đọc .env; start.sh vừa tạo .env từ profile trên."
            local_mode=$(read_env_value LOCAL_POSTGRES_DOCKER)
            case "$local_mode" in
                true|TRUE|1|yes|YES)
                    echo ""
                    echo "Development đang dùng PostgreSQL local qua Docker."
                    echo "Kiểm tra nhanh: docker logs --tail 30 love-memories-postgres"
                    echo "Nếu container bị dừng, chỉ cần chạy lại ./start.sh."
                    ;;
                *)
                    if printf '%s\n' "$diff_out" | grep -qiE 'tenant(/| or )user.*not found|ENOTFOUND'; then
                        echo ""
                        echo "Kết luận: connection string trong $ACTIVE_ENV đang trỏ tới"
                        echo "Supabase project/tenant không còn được hệ thống nhận diện."
                        echo "start.sh không thể tự tạo lại project hoặc mật khẩu database."
                    fi
                    echo ""
                    echo "Thường do một trong các nguyên nhân sau:"
                    echo "  • Supabase project đã bị xoá hoặc đang tạm dừng (paused)."
                    echo "    Dấu hiệu: 'tenant or user not found' / ENOTFOUND."
                    echo "  • Mật khẩu / connection string trong $ACTIVE_ENV đã hết hiệu lực."
                    echo "    Dấu hiệu: 'password authentication failed'."
                    echo "  • Máy không ra được Internet, hoặc bị firewall chặn cổng 5432/6543."
                    echo "    Dấu hiệu: ETIMEDOUT / ECONNREFUSED."
                    echo ""
                    echo "Cách xử lý: mở Supabase → Project Settings → Database → Connection string,"
                    echo "rồi cập nhật DATABASE_URL và DIRECT_URL trong $ACTIVE_ENV."
                    echo "Sau đó chạy lại ./start.sh — schema sẽ được áp tự động."
                    ;;
            esac
            echo ""
            echo "Muốn chạy tạm không cần DB (các trang cần dữ liệu sẽ lỗi):"
            echo "  ./start.sh --skip-checks"
            exit 1
            ;;
    esac

    # ---- Build cho production ---------------------------------------------
    if [ "$RUN_DEV" = false ]; then
        print_step "Build production"
        if [ ! -f .next/BUILD_ID ]; then
            print_status "Chưa có bản build — đang chạy npm run build..."
            if ! npm run build; then
                print_error "Build thất bại."
                exit 1
            fi
            print_success "Build xong."
        else
            print_success "Đã có bản build sẵn (.next/BUILD_ID)."
            printf "Build lại cho chắc? [y/N]: "
            if [ "$AUTO_MODE" = true ]; then
                echo "N (chế độ --auto)"
            else
                read -r rebuild
                case "${rebuild:-N}" in
                    y|Y)
                        if ! npm run build; then
                            print_error "Build thất bại."
                            exit 1
                        fi
                        print_success "Build lại xong."
                        ;;
                esac
            fi
        fi
    fi
fi

# ------------------------------------------------- chế độ chạy & mức log

if [ "$AUTO_MODE" = true ]; then
    exec_choice=1
    log_choice=1
else
    echo ""
    echo "Chế độ chạy:"
    echo "  1) Foreground — hiện log trực tiếp, giữ terminal   [mặc định]"
    echo "  2) Background — chạy nền, không giữ terminal"
    printf "Nhập lựa chọn [1-2]: "
    read -r exec_choice
    exec_choice="${exec_choice:-1}"

    echo ""
    echo "Mức log:"
    echo "  1) Thường   [mặc định]"
    echo "  2) Chi tiết (kèm truy vấn Prisma)"
    printf "Nhập lựa chọn [1-2]: "
    read -r log_choice
    log_choice="${log_choice:-1}"
fi

case "$log_choice" in
    1)
        export DEBUG=""
        export NEXT_DEBUG=""
        ;;
    2)
        export DEBUG="prisma:client,prisma:engine,prisma:query"
        export NEXT_DEBUG="true"
        print_success "Đã bật log chi tiết (truy vấn Prisma + debug Next.js)."
        ;;
    *)
        print_error "Lựa chọn mức log không hợp lệ: '$log_choice'"
        exit 1
        ;;
esac

# ---------------------------------------------------------------- khởi động

# Hai server Next cùng chạy trên một thư mục dự án sẽ ghi chung `.next`, và
# instance mới xoá chunk của instance đang phục vụ. Triệu chứng là trang báo
# "missing required error components, refreshing...", mọi request
# `/_next/static/*` trả 404, còn `app-paths-manifest.json` chỉ còn `{}`.
# Vì vậy luôn dừng instance cũ của đúng dự án này trước khi mở instance mới.
project_root=$(pwd -P)

running_next_pids() {
    # `pgrep -f` khớp cả tiến trình con `next-server`; lọc theo cwd để không
    # chạm vào dự án Next khác đang mở trên cùng máy.
    for pid in $(pgrep -f 'next(-server)?( |$)|next dev|next start' 2>/dev/null); do
        [ "$pid" = "$$" ] && continue
        pid_cwd=$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -1)
        [ -n "$pid_cwd" ] || continue
        case "$pid_cwd" in
            "$project_root"|"$project_root"/*) printf '%s\n' "$pid" ;;
        esac
    done
}

stale_pids=$(running_next_pids | sort -u | tr '\n' ' ')
stale_pids=${stale_pids% }

if [ -n "$stale_pids" ]; then
    print_warning "Đã có server Next của dự án này đang chạy (PID: $stale_pids)."
    print_status "Dừng instance cũ để tránh hai server ghi chung .next..."
    for pid in $stale_pids; do
        kill "$pid" 2>/dev/null
    done
    sleep 3
    for pid in $stale_pids; do
        if ps -p "$pid" > /dev/null 2>&1; then
            kill -9 "$pid" 2>/dev/null
        fi
    done
    sleep 1
    remaining=$(running_next_pids | sort -u | tr '\n' ' ')
    remaining=${remaining% }
    if [ -n "$remaining" ]; then
        print_error "Vẫn còn server cũ đang chạy (PID: $remaining). Hãy dừng thủ công rồi chạy lại."
        exit 1
    fi
    # `.next` do instance cũ sinh ra có thể đã bị ghi đè dở dang.
    if [ -d .next ]; then
        print_status "Xoá .next đã hỏng để build lại sạch..."
        rm -rf .next
    fi
    print_success "Đã dừng instance cũ."
fi

print_step "Khởi động server"

if [ "$RUN_DEV" = true ]; then
    START_CMD="dev"
    URL="http://localhost:3000"
else
    START_CMD="start"
    URL="http://localhost:3000"
fi

case "$exec_choice" in
    1)
        print_status "Đang chạy ở chế độ foreground ($START_CMD)..."
        print_success "Mở $URL sau khi server báo ready. Nhấn Ctrl+C để dừng."
        npm run "$START_CMD"
        ;;
    2)
        if command -v pm2 > /dev/null 2>&1; then
            print_status "Phát hiện PM2 — chạy nền qua PM2..."
            pm2 delete "$PM2_NAME" > /dev/null 2>&1
            if [ -n "$DEBUG" ]; then
                pm2 start npm --name "$PM2_NAME" --update-env -- run "$START_CMD"
            else
                pm2 start npm --name "$PM2_NAME" -- run "$START_CMD"
            fi
            print_success "Đã chạy nền bằng PM2."
            echo "  Trạng thái: pm2 status"
            echo "  Xem log:    pm2 logs $PM2_NAME"
            echo "  Dừng:       pm2 delete $PM2_NAME"
        else
            print_warning "Không có PM2 — dùng nohup thay thế."
            if [ -n "$DEBUG" ]; then
                nohup env DEBUG="$DEBUG" npm run "$START_CMD" > "$LOG_FILE" 2>&1 &
            else
                nohup npm run "$START_CMD" > "$LOG_FILE" 2>&1 &
            fi
            PID=$!
            print_success "Đã chạy nền bằng nohup (PID $PID)."
            echo "  Log:  tail -f $LOG_FILE"
            echo "  Dừng: kill $PID"
        fi
        echo ""
        print_success "Truy cập $URL"
        ;;
    *)
        print_error "Lựa chọn chế độ chạy không hợp lệ: '$exec_choice'"
        exit 1
        ;;
esac
