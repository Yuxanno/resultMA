#!/usr/bin/env python3
"""
Color OMR Scanner - For pre-printed colored bubble sheets
Green circles = empty, Red/Dark circles = filled
"""
     
import cv2
import numpy as np
import json
import sys
from pathlib import Path


def preprocess_image(image_path):
    """Load and preprocess image"""
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Cannot load image: {image_path}")
    
    h, w = img.shape[:2]
    if w > 1500:
        scale = 1500 / w
        img = cv2.resize(img, (int(w * scale), int(h * scale)))
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    print(f"DEBUG: Image size: {img.shape[1]}x{img.shape[0]}", file=sys.stderr)
    
    return img, gray


def find_circles_aggressive(gray):
    """Find circles with aggressive parameters for pre-printed circles"""
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Параметры для поиска предварительно напечатанных кружков
    circles = cv2.HoughCircles(
        blurred,
        cv2.HOUGH_GRADIENT,
        dp=1,
        minDist=15,  # Минимальное расстояние между кружками
        param1=50,   # Порог для детектора границ
        param2=25,   # Порог для центров кружков
        minRadius=8,
        maxRadius=20
    )
    
    if circles is None:
        return []
    
    circles = np.uint16(np.around(circles[0]))
    print(f"DEBUG: Found {len(circles)} circles", file=sys.stderr)
    
    return circles


def detect_columns(circles):
    """Detect 3 columns based on X coordinates"""
    if len(circles) == 0:
        return []
    
    x_coords = sorted([c[0] for c in circles])
    
    # Find large gaps (column separators)
    gaps = []
    for i in range(len(x_coords) - 1):
        gap = x_coords[i+1] - x_coords[i]
        if gap > 80:  # Large gap = column boundary
            mid_point = (x_coords[i] + x_coords[i+1]) / 2
            gaps.append(mid_point)
    
    # Sort and take largest gaps
    if len(gaps) >= 2:
        gaps = sorted(gaps)[:2]
    
    # Define column boundaries
    if len(gaps) == 0:
        # Single column
        boundaries = [(min(x_coords), max(x_coords))]
    elif len(gaps) == 1:
        # Two columns
        boundaries = [
            (min(x_coords), gaps[0]),
            (gaps[0], max(x_coords))
        ]
    else:
        # Three columns
        boundaries = [
            (min(x_coords), gaps[0]),
            (gaps[0], gaps[1]),
            (gaps[1], max(x_coords))
        ]
    
    print(f"DEBUG: Detected {len(boundaries)} column(s)", file=sys.stderr)
    for i, (x_min, x_max) in enumerate(boundaries):
        print(f"DEBUG: Column {i+1}: X={int(x_min)}-{int(x_max)}", file=sys.stderr)
    
    return boundaries


def sort_into_questions(circles, boundaries, expected_questions=15):
    """Sort circles into questions (4 per row, multiple columns)
    
    Args:
        circles: List of detected circles
        boundaries: Column boundaries
        expected_questions: Expected number of questions (default 15)
    
    Returns:
        List of questions, where each question is either:
        - List of 4 circles (valid question)
        - None (missing/incomplete question)
    """
    # Separate by column
    columns = [[] for _ in range(len(boundaries))]
    
    for circle in circles:
        x = circle[0]
        for col_idx, (x_min, x_max) in enumerate(boundaries):
            if x_min <= x <= x_max:
                columns[col_idx].append(circle)
                break
    
    # Группируем вопросы по столбцам
    column_questions = []
    
    for col_idx, col_circles in enumerate(columns):
        if len(col_circles) == 0:
            continue
        
        print(f"DEBUG: Column {col_idx + 1}: {len(col_circles)} circles", file=sys.stderr)
        
        # Sort by Y
        sorted_circles = sorted(col_circles, key=lambda c: c[1])
        
        # Group into rows (4 bubbles per question)
        current_row = [sorted_circles[0]]
        col_questions = []
        
        for circle in sorted_circles[1:]:
            y_diff = abs(circle[1] - current_row[0][1])
            
            if y_diff < 20:  # Same row
                current_row.append(circle)
            else:
                # Process row
                if len(current_row) == 4:
                    # Valid question with 4 bubbles
                    current_row.sort(key=lambda c: c[0])
                    col_questions.append(current_row[:4])
                elif len(current_row) > 0:
                    # Incomplete row - still add as None to maintain indexing
                    print(f"DEBUG: Incomplete row with {len(current_row)} circles (expected 4)", file=sys.stderr)
                    col_questions.append(None)
                
                current_row = [circle]
        
        # Last row
        if len(current_row) == 4:
            current_row.sort(key=lambda c: c[0])
            col_questions.append(current_row[:4])
        elif len(current_row) > 0:
            print(f"DEBUG: Last incomplete row with {len(current_row)} circles (expected 4)", file=sys.stderr)
            col_questions.append(None)
        
        column_questions.append(col_questions)
    
    # Объединяем вопросы: сначала все из первого столбца (1,2,3...), потом все из второго (11,12,13...)
    all_questions = []
    for col_q in column_questions:
        all_questions.extend(col_q)
    
    # Pad with None if we have fewer questions than expected
    while len(all_questions) < expected_questions:
        all_questions.append(None)
    
    print(f"DEBUG: Total questions: {len(all_questions)} (expected: {expected_questions})", file=sys.stderr)
    valid_count = sum(1 for q in all_questions if q is not None)
    print(f"DEBUG: Valid questions: {valid_count}, Missing: {expected_questions - valid_count}", file=sys.stderr)
    
    return all_questions


def is_circle_filled_color(img, gray, x, y, r):
    """
    Detect if circle is filled by checking color
    Green = empty, Red/Dark = filled
    """
    # Extract circle region
    mask = np.zeros(gray.shape, dtype="uint8")
    cv2.circle(mask, (x, y), int(r * 0.7), 255, -1)
    
    # Get pixels in circle
    circle_pixels = img[mask == 255]
    
    if len(circle_pixels) == 0:
        return False, 0, 0
    
    # Calculate average color
    avg_b = np.mean(circle_pixels[:, 0])
    avg_g = np.mean(circle_pixels[:, 1])
    avg_r = np.mean(circle_pixels[:, 2])
    
    # Green circles: high G, low R
    # Red/Dark circles: high R or low overall brightness
    
    # Check if green (empty)
    is_green = avg_g > avg_r + 20 and avg_g > avg_b + 20
    
    # Check if red (filled)
    is_red = avg_r > avg_g + 20 and avg_r > avg_b + 10
    
    # Check if dark (filled with pencil)
    brightness = (avg_r + avg_g + avg_b) / 3
    is_dark = brightness < 100
    
    is_filled = is_red or is_dark
    
    return is_filled, brightness, (avg_r, avg_g, avg_b)


def grade_exam(image_path, correct_answers=None, qr_data=None):
    """Main grading function
    
    Args:
        image_path: Path to the answer sheet image
        correct_answers: Dict of correct answers (optional)
        qr_data: Dict with QR code data including 'totalQuestions' (optional)
    """
    try:
        # Determine expected number of questions
        expected_questions = 15  # Default
        if qr_data and 'totalQuestions' in qr_data:
            expected_questions = int(qr_data['totalQuestions'])
            print(f"DEBUG: Using {expected_questions} questions from QR code", file=sys.stderr)
        else:
            print(f"DEBUG: Using default {expected_questions} questions (no QR data)", file=sys.stderr)
        
        img, gray = preprocess_image(image_path)
        
        circles = find_circles_aggressive(gray)
        
        if len(circles) == 0:
            return {
                'success': False,
                'error': 'No circles detected',
                'detected_answers': {},
                'total_questions': 0
            }
        
        boundaries = detect_columns(circles)
        questions = sort_into_questions(circles, boundaries, expected_questions=expected_questions)
        
        if len(questions) == 0:
            return {
                'success': False,
                'error': f'Found {len(circles)} circles but could not organize into questions',
                'detected_answers': {},
                'total_questions': 0
            }
        
        detected_answers = {}
        invalid_answers = {}  # Questions with multiple answers
        options = ['A', 'B', 'C', 'D']
        
        annotated = img.copy()
        
        for question_num, row_circles in enumerate(questions, start=1):
            # Skip if question is None (missing/incomplete)
            if row_circles is None:
                print(f"DEBUG Q{question_num}: Missing or incomplete (no circles found)", file=sys.stderr)
                # Draw "MISSING" indicator
                # We don't have coordinates, so skip drawing
                continue
            
            filled_bubbles = []
            
            # Рисуем номер вопроса слева от ряда
            if len(row_circles) > 0:
                first_circle = row_circles[0]
                x_first, y_first, r_first = int(first_circle[0]), int(first_circle[1]), int(first_circle[2])
                # Номер вопроса слева
                cv2.putText(annotated, f"{question_num}.", (x_first - 40, y_first + 5), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)  # Красный номер
            
            # Рисуем индексы внутри кружков для отладки
            for idx, circle in enumerate(row_circles):
                x, y, r = int(circle[0]), int(circle[1]), int(circle[2])
                
                # Рисуем индекс внутри кружка (0, 1, 2, 3)
                cv2.putText(annotated, str(idx), (x-4, y+4), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, (128, 128, 128), 1)
            
            # ПОТОМ проверяем заполненность
            for idx, circle in enumerate(row_circles):
                x, y, r = int(circle[0]), int(circle[1]), int(circle[2])
                
                is_filled, brightness, avg_color = is_circle_filled_color(img, gray, x, y, r)
                
                if is_filled:
                    filled_bubbles.append((idx, options[idx], x, y, r))
            
            # Check if multiple answers
            if len(filled_bubbles) == 1:
                # Single answer
                detected_answers[question_num] = filled_bubbles[0][1]
                
                idx, ans, x, y, r = filled_bubbles[0]
                
                # Проверяем правильность ответа
                is_correct = False
                if correct_answers and str(question_num) in correct_answers:
                    is_correct = (ans == correct_answers[str(question_num)])
                
                if is_correct:
                    # Правильный ответ - зелёный круг + зелёная галочка
                    cv2.circle(annotated, (x, y), r, (0, 255, 0), 3)  # Зелёный круг
                    # Рисуем галочку (checkmark)
                    check_size = int(r * 0.6)
                    cv2.line(annotated, (x - check_size//3, y), (x - check_size//6, y + check_size//2), (0, 255, 0), 3)
                    cv2.line(annotated, (x - check_size//6, y + check_size//2), (x + check_size//2, y - check_size//2), (0, 255, 0), 3)
                else:
                    # Неправильный ответ - красный круг + красный крестик
                    cv2.circle(annotated, (x, y), r, (0, 0, 255), 3)
                    cv2.putText(annotated, "X", (x-5, y+5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                
            elif len(filled_bubbles) > 1:
                # Multiple answers - INVALID (yellow)
                answers_list = [b[1] for b in filled_bubbles]
                invalid_answers[question_num] = answers_list
                
                # Don't add to detected_answers (invalid)
                print(f"DEBUG Q{question_num}: Multiple bubbles filled: {answers_list}", file=sys.stderr)
                
                # Draw yellow for all filled bubbles in this question
                for idx, ans, x, y, r in filled_bubbles:
                    cv2.circle(annotated, (x, y), r, (0, 255, 255), 3)  # Yellow (BGR)
                    cv2.putText(annotated, "!", (x-5, y+5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
            
            # Draw light blue for empty bubbles
            for idx, circle in enumerate(row_circles):
                x, y, r = int(circle[0]), int(circle[1]), int(circle[2])
                
                # Check if this bubble was marked as filled
                is_in_filled = any(x == fb[2] and y == fb[3] for fb in filled_bubbles)
                
                if not is_in_filled:
                    cv2.circle(annotated, (x, y), r, (255, 200, 100), 2)  # Слабо синий (BGR: светло-голубой)
        
        input_path = Path(image_path)
        output_filename = f"checked_{input_path.name}"
        output_path = input_path.parent / output_filename
        cv2.imwrite(str(output_path), annotated)
        
        print(f"DEBUG: Detected {len(detected_answers)} valid answers from {len(questions)} questions", file=sys.stderr)
        missing_count = sum(1 for q in questions if q is None)
        if missing_count > 0:
            print(f"DEBUG: Found {missing_count} missing/incomplete questions", file=sys.stderr)
        if invalid_answers:
            print(f"DEBUG: Found {len(invalid_answers)} questions with multiple answers (invalid)", file=sys.stderr)
        
        result = {
            'success': True,
            'detected_answers': detected_answers,
            'total_questions': len(questions),
            'annotated_image': output_filename,
            'circles_found': len(circles),
            'rows_found': len(questions)
        }
        
        # Add invalid answers info
        if invalid_answers:
            result['invalid_answers'] = invalid_answers
            result['warning'] = f'{len(invalid_answers)} questions have multiple answers marked'
        
        # Детальное логирование для отладки
        print(f"DEBUG: Final result summary:", file=sys.stderr)
        print(f"  Total questions: {len(questions)}", file=sys.stderr)
        print(f"  Valid answers: {len(detected_answers)}", file=sys.stderr)
        print(f"  Invalid answers: {len(invalid_answers)}", file=sys.stderr)
        print(f"  Missing questions: {missing_count}", file=sys.stderr)
        print(f"  First 15 detected answers:", file=sys.stderr)
        for i in range(1, min(16, len(questions) + 1)):
            if questions[i-1] is None:
                print(f"    Q{i}: MISSING", file=sys.stderr)
            elif i in detected_answers:
                print(f"    Q{i}: {detected_answers[i]}", file=sys.stderr)
            elif i in invalid_answers:
                print(f"    Q{i}: INVALID ({', '.join(invalid_answers[i])})", file=sys.stderr)
            else:
                print(f"    Q{i}: NO ANSWER", file=sys.stderr)
        
        return result
        
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return {
            'success': False,
            'error': str(e),
            'detected_answers': {},
            'total_questions': 0
        }


def main():
    """CLI interface"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python omr_color.py <image_path> [correct_answers_json] [qr_data_json]'
        }))
        sys.exit(1)
    
    image_path = sys.argv[1]
    correct_answers = None
    qr_data = None
    
    # Если передан второй аргумент - это JSON с правильными ответами
    if len(sys.argv) >= 3:
        try:
            correct_answers = json.loads(sys.argv[2])
            print(f"DEBUG: Loaded correct answers: {len(correct_answers)} questions", file=sys.stderr)
        except json.JSONDecodeError as e:
            print(f"WARNING: Failed to parse correct answers: {e}", file=sys.stderr)
    
    # Если передан третий аргумент - это JSON с данными QR-кода
    if len(sys.argv) >= 4:
        try:
            qr_data = json.loads(sys.argv[3])
            print(f"DEBUG: Loaded QR data: {qr_data}", file=sys.stderr)
        except json.JSONDecodeError as e:
            print(f"WARNING: Failed to parse QR data: {e}", file=sys.stderr)
    
    result = grade_exam(image_path, correct_answers, qr_data)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
